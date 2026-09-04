"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";
import { logPaymentEvent } from "@/lib/payment-events";
import { sendPaymentNotifications } from "@/lib/notifications";

export async function reconcilePayment(reference: string) {
  await requireAdmin();
  const db = createServiceClient();
  const { data: payment } = await db.from("payments").select("reference,expected_amount,currency,status").eq("reference", reference).single();
  if (!payment) return { success: false, error: "Payment not found." };
  if (payment.status === "SUCCESS") { await sendPaymentNotifications(reference).catch(console.error); return { success: true }; }
  try {
    const transaction = await verifyPaystackTransaction(reference);
    const valid = transaction.status === "success" && transaction.reference === reference && transaction.amount === payment.expected_amount && transaction.currency.toUpperCase() === payment.currency.toUpperCase();
    if (!valid) {
      await logPaymentEvent({ reference, eventType: "reconciliation_pending", source: "admin", status: "INFO" });
      return { success: false, error: "Paystack has not confirmed this exact amount and currency." };
    }
    const { error } = await db.rpc("complete_paystack_payment", { p_reference: reference, p_transaction_id: String(transaction.id), p_amount: transaction.amount, p_currency: transaction.currency, p_channel: transaction.channel, p_paid_at: transaction.paid_at || transaction.paidAt || new Date().toISOString() });
    if (error) throw error;
    await logPaymentEvent({ reference, eventType: "payment_reconciled", source: "admin", status: "SUCCESS" });
    await sendPaymentNotifications(reference).catch(console.error);
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reconciliation failed";
    await logPaymentEvent({ reference, eventType: "reconciliation_failed", source: "admin", status: "FAILED", error: message });
    return { success: false, error: message };
  }
}
