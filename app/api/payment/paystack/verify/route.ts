import { NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const reference = new URL(request.url).searchParams.get("reference")?.trim();
    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to verify payment" },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient();
    const { data: payment, error: paymentError } = await serviceClient
      .from("payments")
      .select("order_id, user_id, reference, expected_amount, currency, status")
      .eq("reference", reference)
      .eq("user_id", user.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    if (payment.status === "SUCCESS") {
      return NextResponse.json({ success: true, orderId: payment.order_id });
    }

    const transaction = await verifyPaystackTransaction(reference);
    const isValid =
      transaction.status === "success" &&
      transaction.reference === payment.reference &&
      transaction.amount === payment.expected_amount &&
      transaction.currency.toUpperCase() === payment.currency.toUpperCase();

    if (!isValid) {
      return NextResponse.json(
        { success: false, pending: true, error: "Payment has not been confirmed" },
        { status: 409 }
      );
    }

    const { data: orderId, error: completionError } = await serviceClient.rpc(
      "complete_paystack_payment",
      {
        p_reference: payment.reference,
        p_transaction_id: transaction.id.toString(),
        p_amount: transaction.amount,
        p_currency: transaction.currency,
        p_channel: transaction.channel,
        p_paid_at: transaction.paid_at || transaction.paidAt || new Date().toISOString(),
      }
    );

    if (completionError) {
      console.error("Failed to complete verified payment:", completionError);
      return NextResponse.json(
        { success: false, error: "Payment was verified but could not be recorded" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orderId: orderId || payment.order_id });
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to verify payment. Please try again." },
      { status: 500 }
    );
  }
}
