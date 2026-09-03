-- ============================================================
-- NoveltyScholars Paystack payment storage and atomic completion
-- Run this file once in Supabase -> SQL Editor before deploying.
-- Amounts are stored as integer currency subunits (USD cents).
-- ============================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'paystack' check (provider = 'paystack'),
  reference text not null unique,
  expected_amount integer not null check (expected_amount > 0),
  amount_paid integer check (amount_paid is null or amount_paid > 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  status text not null default 'INITIALIZED'
    check (status in ('INITIALIZED', 'PENDING', 'SUCCESS', 'FAILED')),
  authorization_url text,
  access_code text,
  transaction_id text,
  channel text,
  failure_reason text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx
  on public.payments(order_id);

create index if not exists payments_user_id_idx
  on public.payments(user_id);

-- Only one checkout attempt may be active for an order. This also prevents
-- an already-paid order from being charged again through this application.
create unique index if not exists payments_one_active_per_order_idx
  on public.payments(order_id)
  where status in ('INITIALIZED', 'PENDING', 'SUCCESS');

alter table public.payments enable row level security;

drop policy if exists "Users can read their own payments" on public.payments;
create policy "Users can read their own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

-- There are intentionally no client insert/update/delete policies. Payment
-- writes only happen in authenticated server routes using the service role.

create or replace function public.complete_paystack_payment(
  p_reference text,
  p_transaction_id text,
  p_amount integer,
  p_currency text,
  p_channel text,
  p_paid_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
begin
  select *
    into v_payment
    from public.payments
    where reference = p_reference
    for update;

  if not found then
    raise exception 'Unknown payment reference';
  end if;

  if v_payment.expected_amount <> p_amount then
    raise exception 'Payment amount does not match order amount';
  end if;

  if upper(v_payment.currency) <> upper(p_currency) then
    raise exception 'Payment currency does not match order currency';
  end if;

  if v_payment.status = 'SUCCESS' then
    return v_payment.order_id;
  end if;

  update public.payments
    set status = 'SUCCESS',
        amount_paid = p_amount,
        transaction_id = p_transaction_id,
        channel = p_channel,
        paid_at = p_paid_at,
        failure_reason = null,
        updated_at = now()
    where id = v_payment.id;

  update public.orders
    set status = case
          when status = 'PENDING_PAYMENT' then 'PAID'
          else status
        end,
        updated_at = now()
    where id = v_payment.order_id;

  return v_payment.order_id;
end;
$$;

revoke all on function public.complete_paystack_payment(
  text, text, integer, text, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.complete_paystack_payment(
  text, text, integer, text, text, timestamptz
) to service_role;
