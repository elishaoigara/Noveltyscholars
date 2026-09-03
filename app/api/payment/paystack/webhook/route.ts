import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
  };
};

function hasValidSignature(rawBody: string, signature: string | null): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !signature) return false;

  const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");
  if (signature.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!hasValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as PaystackWebhookEvent;
    if (event.event !== "charge.success" || !event.data?.reference) {
      return NextResponse.json({ received: true });
    }

    const serviceClient = createServiceClient();
    const { data: payment, error: paymentError } = await serviceClient
      .from("payments")
      .select("order_id, reference, expected_amount, currency, status")
      .eq("reference", event.data.reference)
      .maybeSingle();

    // The Paystack account may receive payments created outside this app.
    if (paymentError || !payment) {
      console.warn("Ignoring Paystack payment with unknown reference", event.data.reference);
      return NextResponse.json({ received: true, ignored: true });
    }

    if (payment.status === "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    const transaction = await verifyPaystackTransaction(payment.reference);
    const isValid =
      transaction.status === "success" &&
      transaction.reference === payment.reference &&
      transaction.amount === payment.expected_amount &&
      transaction.currency.toUpperCase() === payment.currency.toUpperCase();

    if (!isValid) {
      console.error("Paystack webhook verification mismatch", payment.reference);
      return NextResponse.json({ received: true, ignored: true });
    }

    const { error: completionError } = await serviceClient.rpc(
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
      console.error("Paystack webhook database error:", completionError);
      return NextResponse.json({ error: "Unable to record payment" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
