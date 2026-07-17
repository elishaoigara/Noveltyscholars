import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // TODO: Replace with Razorpay/Stripe webhook handler
    // For Razorpay:
    // 1. Verify webhook signature using webhook secret
    // 2. Extract order_id from payload
    // 3. Update order status in Supabase using service_role
    // 4. Return 200 to acknowledge receipt

    // For Stripe:
    // 1. Verify Stripe webhook signature
    // 2. Handle checkout.session.completed event
    // 3. Extract client_reference_id (our order_id)
    // 4. Update order status in Supabase using service_role
    // 5. Return 200

    const body = await request.json();
    console.log("Webhook received:", body);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 400 }
    );
  }
}
