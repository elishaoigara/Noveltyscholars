import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Verify order exists and is in PENDING_PAYMENT status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { success: false, error: "Order is not in pending payment status" },
        { status: 400 }
      );
    }

    // Update order status to PAID
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "PAID", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // TODO: Replace with Razorpay/Stripe - User will integrate
    // When integrating Razorpay:
    // 1. Create a Razorpay order server-side
    // 2. Return the order ID to the client
    // 3. Client confirms payment via Razorpay Checkout
    // 4. Razorpay webhook hits /api/payment/webhook to verify and update status
    // When integrating Stripe:
    // 1. Create a Stripe Checkout Session server-side
    // 2. Redirect to Stripe Checkout
    // 3. Stripe webhook hits /api/payment/webhook to verify and update status

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mock payment error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
