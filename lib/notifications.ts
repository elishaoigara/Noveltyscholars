import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { createServiceClient } from "@/lib/supabase/service";

const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || "https://noveltyscholars.vercel.app").replace(/\/$/, "");

export async function sendNewOrderNotifications(orderId: string) {
  const db = createServiceClient();
  const { data: order } = await db.from("orders").select("id,order_code,user_id,subject,final_price,total_price").eq("id", orderId).single();
  if (!order) return;
  const { data: profile } = await db.from("profiles").select("email,full_name").eq("id", order.user_id).single();
  if (!profile?.email) return;
  const amount = order.final_price ?? order.total_price;
  await sendEmail({
    to: profile.email,
    subject: `Order ${order.order_code} created`,
    html: emailLayout("Your order is ready for payment", `<p>Hello ${escapeHtml(profile.full_name || "there")},</p><p>We saved your order <strong>${escapeHtml(order.order_code)}</strong> for ${escapeHtml(formatCurrency(amount))}. You can resume payment from your dashboard.</p><p><a href="${appUrl()}/checkout/${order.id}">Resume secure payment</a></p>`),
  });
  const admin = process.env.ADMIN_EMAIL;
  if (admin) await sendEmail({ to: admin, subject: `New order: ${order.order_code}`, html: emailLayout("New order received", `<p>${escapeHtml(profile.email)} created <strong>${escapeHtml(order.order_code)}</strong> for ${escapeHtml(formatCurrency(amount))}.</p><p><a href="${appUrl()}/admin/orders/${order.id}">View order</a></p>`) });
}

export async function sendPaymentNotifications(reference: string) {
  const db = createServiceClient();
  const { data: payment } = await db.from("payments").select("reference,order_id,user_id,amount_paid,expected_amount,currency,paid_at,receipt_email_sent_at").eq("reference", reference).single();
  if (!payment || payment.receipt_email_sent_at) return;
  const claimedAt = new Date().toISOString();
  const { data: claimed } = await db.from("payments").update({ receipt_email_sent_at: claimedAt }).eq("reference", reference).is("receipt_email_sent_at", null).select("reference").maybeSingle();
  if (!claimed) return;
  const [{ data: order }, { data: profile }] = await Promise.all([
    db.from("orders").select("order_code").eq("id", payment.order_id).single(),
    db.from("profiles").select("email,full_name").eq("id", payment.user_id).single(),
  ]);
  const amount = (payment.amount_paid ?? payment.expected_amount) / 100;
  const receiptUrl = `${appUrl()}/dashboard/receipts/${encodeURIComponent(reference)}`;
  const sent = !!profile?.email && await sendEmail({ to: profile.email, subject: `Payment receipt: ${order?.order_code || reference}`, html: emailLayout("Payment received", `<p>Hello ${escapeHtml(profile?.full_name || "there")},</p><p>We received <strong>${escapeHtml(formatCurrency(amount))}</strong> for order <strong>${escapeHtml(order?.order_code || reference)}</strong>.</p><p><a href="${receiptUrl}">View and print receipt</a></p>`) });
  if (!sent) {
    await db.from("payments").update({ receipt_email_sent_at: null }).eq("reference", reference).eq("receipt_email_sent_at", claimedAt);
    return;
  }
  const admin = process.env.ADMIN_EMAIL;
  if (admin) await sendEmail({ to: admin, subject: `Payment received: ${order?.order_code || reference}`, html: emailLayout("Successful payment", `<p>${escapeHtml(profile?.email || "Customer")} paid <strong>${escapeHtml(formatCurrency(amount))}</strong>.</p><p><a href="${appUrl()}/admin/payments">Open payments dashboard</a></p>`) });
}
