-- NoveltyScholars production revamp. Run once in Supabase SQL Editor.
begin;

alter table public.orders add column if not exists promo_redeemed_at timestamptz;
alter table public.payments add column if not exists receipt_email_sent_at timestamptz;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in
  ('PENDING_PAYMENT','PAID','IN_PROGRESS','DELIVERED','COMPLETED','REVISION','CANCELLED'));

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  reference text,
  event_type text not null,
  source text not null check (source in ('initialize','callback','webhook','admin')),
  status text not null check (status in ('INFO','SUCCESS','FAILED')),
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists payment_events_reference_idx on public.payment_events(reference);
create index if not exists payment_events_created_at_idx on public.payment_events(created_at desc);
alter table public.payment_events enable row level security;
drop policy if exists "Admins can read payment events" on public.payment_events;
create policy "Admins can read payment events" on public.payment_events for select
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create or replace function public.complete_paystack_payment(
  p_reference text, p_transaction_id text, p_amount integer, p_currency text,
  p_channel text, p_paid_at timestamptz
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_payment public.payments%rowtype; v_order public.orders%rowtype;
begin
  select * into v_payment from public.payments where reference = p_reference for update;
  if not found then raise exception 'Payment not found'; end if;
  if v_payment.status = 'SUCCESS' then return v_payment.order_id; end if;
  if v_payment.expected_amount <> p_amount or upper(v_payment.currency) <> upper(p_currency) then
    raise exception 'Payment amount or currency mismatch';
  end if;
  select * into v_order from public.orders where id = v_payment.order_id for update;
  if v_order.status = 'CANCELLED' then raise exception 'Order was cancelled'; end if;
  update public.payments set status='SUCCESS', amount_paid=p_amount,
    transaction_id=p_transaction_id, channel=p_channel, paid_at=p_paid_at,
    failure_reason=null, updated_at=now() where id=v_payment.id;
  if v_order.discount_code is not null and v_order.promo_redeemed_at is null then
    update public.promo_codes set used_count=used_count+1 where upper(code)=upper(v_order.discount_code);
    update public.orders set promo_redeemed_at=now() where id=v_order.id;
  end if;
  update public.orders set status='PAID', updated_at=now() where id=v_order.id;
  return v_order.id;
end $$;
revoke all on function public.complete_paystack_payment(text,text,integer,text,text,timestamptz) from public;
grant execute on function public.complete_paystack_payment(text,text,integer,text,text,timestamptz) to service_role;

insert into public.services (name,slug,description,base_price,features,service_type,is_featured)
values
('Essay Coaching & Editing','essay-coaching-editing','Structured feedback, editing and one-to-one guidance for stronger original essays.',18,'["UK and US academic conventions","Structure and argument feedback","APA, MLA, Chicago and Harvard styles"]'::jsonb,'STANDARD',true),
('Assignment Support','assignment-support','Guided help understanding briefs, planning research and improving your own submission.',20,'["Brief interpretation","Research planning","Draft feedback"]'::jsonb,'STANDARD',true),
('Dissertation & Thesis Guidance','dissertation-thesis-guidance','Milestone-based support for proposals, literature reviews, methods and editing.',28,'["Proposal planning","Chapter feedback","Harvard, APA and OSCOLA support"]'::jsonb,'STANDARD',true),
('Research Paper Support','research-paper-support','Research planning, source evaluation, structure coaching and editorial review.',24,'["Source evaluation","Outline development","Citation review"]'::jsonb,'STANDARD',true),
('Coursework Support','coursework-support','Practical tutoring and feedback across UK coursework and US course assignments.',21,'["UK and US curricula","Study planning","Draft feedback"]'::jsonb,'STANDARD',false),
('Case Study Analysis','case-study-analysis','Framework selection, evidence review and coaching for clear case analysis.',22,'["Business and social sciences","Evidence mapping","Editorial review"]'::jsonb,'STANDARD',false),
('Literature Review Support','literature-review-support','Search strategy, synthesis coaching and structural editing for literature reviews.',25,'["Search strategy","Theme synthesis","Reference consistency"]'::jsonb,'STANDARD',false),
('Proofreading & Editing','proofreading-editing','Language, clarity, consistency and formatting review for your completed draft.',12,'["UK or US English","Clarity and grammar","Style consistency"]'::jsonb,'STANDARD',true),
('Citation & Formatting','citation-formatting','Reference-list and in-text citation checks across major UK and US styles.',10,'["APA and MLA","Chicago and Harvard","OSCOLA formatting"]'::jsonb,'STANDARD',false),
('Presentation Support','presentation-support','Coaching and editorial help for academic slides, speaker notes and visual structure.',16,'["Slide structure","Speaker notes","Clarity review"]'::jsonb,'STANDARD',false),
('Personal Statement Review','personal-statement-review','Editorial feedback for UK UCAS and US college or graduate applications.',24,'["UCAS conventions","US admissions conventions","Voice-preserving edit"]'::jsonb,'STANDARD',true),
('Statistics & Data Analysis','statistics-data-analysis','Tutoring in method selection, interpretation and clear presentation of results.',32,'["Method coaching","Result interpretation","Table and chart review"]'::jsonb,'STANDARD',false),
('Online Tutoring','online-tutoring','Live one-to-one academic tutoring arranged around your subject and goals.',49,'["One live class","UK and US time zones","Study plan included"]'::jsonb,'ONLINE_CLASS',true),
('Exam Preparation','exam-preparation','Focused revision planning, practice questions and live exam-preparation tutoring.',59,'["One preparation session","Practice strategy","No live-exam impersonation"]'::jsonb,'ONLINE_EXAM',true)
on conflict (slug) do update set name=excluded.name, description=excluded.description,
base_price=excluded.base_price, features=excluded.features, service_type=excluded.service_type,
is_featured=excluded.is_featured;

update public.services set name='Online Tutoring', description='Live tutoring, course planning and study support. No account access or student impersonation.', base_price=49, service_type='ONLINE_CLASS', features='["One live class","UK and US time zones","No password sharing"]'::jsonb where slug='take-my-online-class';
update public.services set name='Exam Preparation', description='Revision planning, practice strategy and subject tutoring. We do not sit assessments for students.', base_price=59, service_type='ONLINE_EXAM', features='["One preparation session","Practice strategy","No live-exam impersonation"]'::jsonb where slug='take-my-online-exam';

commit;
