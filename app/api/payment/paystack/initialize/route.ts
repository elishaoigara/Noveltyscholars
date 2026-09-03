import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { initializePaystackTransaction, toPaystackSubunit } from "@/lib/paystack";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const DEFAULT_APP_URL = "https://noveltyscholars.vercel.app";
const CURRENCY = "USD";

function getAppUrl(request: Request): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const requestOrigin = new URL(request.url).origin;
  const appUrl = configuredUrl || requestOrigin || DEFAULT_APP_URL;
  return appUrl.replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to pay" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { orderId?: unknown };
    if (typeof body.orderId !== "string" || !body.orderId) {
      return NextResponse.json(
        { success: false, error: "A valid orderId is required" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, order_code, user_id, total_price, final_price, status")
      .eq("id", body.orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { success: false, error: "This order is not awaiting payment" },
        { status: 409 }
      );
    }

    const payableAmount = order.final_price ?? order.total_price;
    const expectedAmount = toPaystackSubunit(payableAmount);
    const safeOrderCode = order.order_code.replace(/[^a-zA-Z0-9.-]/g, "");
    const reference = `NS-${safeOrderCode}-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const callbackUrl = `${getAppUrl(request)}/payment/callback`;

    const { error: paymentError } = await serviceClient.from("payments").insert({
      order_id: order.id,
      user_id: user.id,
      provider: "paystack",
      reference,
      expected_amount: expectedAmount,
      amount_paid: null,
      currency: CURRENCY,
      status: "INITIALIZED",
      authorization_url: null,
      access_code: null,
      transaction_id: null,
      channel: null,
      failure_reason: null,
      paid_at: null,
    });

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      return NextResponse.json(
        { success: false, error: "Unable to prepare payment" },
        { status: 500 }
      );
    }

    try {
      const transaction = await initializePaystackTransaction({
        email: user.email,
        amount: expectedAmount,
        currency: CURRENCY,
        reference,
        callbackUrl,
        metadata: {
          order_id: order.id,
          order_code: order.order_code,
          user_id: user.id,
        },
      });

      if (transaction.reference !== reference) {
        throw new Error("Paystack returned an unexpected reference");
      }

      const authorizationUrl = new URL(transaction.authorization_url);
      if (
        authorizationUrl.protocol !== "https:" ||
        !authorizationUrl.hostname.endsWith("paystack.com")
      ) {
        throw new Error("Paystack returned an invalid checkout URL");
      }

      const { error: updateError } = await serviceClient
        .from("payments")
        .update({
          status: "PENDING",
          authorization_url: transaction.authorization_url,
          access_code: transaction.access_code,
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);

      if (updateError) {
        throw new Error("Unable to save Paystack transaction");
      }

      return NextResponse.json({
        success: true,
        authorizationUrl: transaction.authorization_url,
        reference,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Paystack initialization failed";
      await serviceClient
        .from("payments")
        .update({
          status: "FAILED",
          failure_reason: message,
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);
      throw error;
    }
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to initialize payment. Please try again." },
      { status: 500 }
    );
  }
}
