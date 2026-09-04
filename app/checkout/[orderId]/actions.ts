"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function applyPromoCode(orderId: string, rawCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to apply a promo code." };
  const db = createServiceClient();
  const { data: order } = await db.from("orders").select("id,user_id,status,total_price").eq("id", orderId).single();
  if (!order || order.user_id !== user.id) return { success: false, error: "Order not found." };
  if (order.status !== "PENDING_PAYMENT") return { success: false, error: "Promo codes only apply before payment." };
  const active = await db.from("payments").select("id").eq("order_id", order.id).in("status", ["INITIALIZED", "PENDING"]).maybeSingle();
  if (active.data) return { success: false, error: "A payment is already open. Finish it or wait ten minutes before changing the code." };
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    await db.from("orders").update({ discount_code: null, discount_amount: 0, final_price: null }).eq("id", order.id);
    revalidatePath(`/checkout/${order.id}`);
    return { success: true, discount: 0, finalPrice: order.total_price };
  }
  const { data: promo } = await db.from("promo_codes").select("*").eq("code", code).eq("is_active", true).maybeSingle();
  if (!promo || (promo.expires_at && new Date(promo.expires_at) <= new Date()) || promo.used_count >= promo.max_uses || order.total_price < promo.min_order_amount) {
    return { success: false, error: "This promo code is invalid, expired, fully used, or below its minimum order value." };
  }
  const discount = promo.discount_type === "PERCENTAGE"
    ? Math.round(order.total_price * Math.min(promo.discount_value, 100) / 100)
    : Math.min(promo.discount_value, order.total_price);
  const finalPrice = Math.max(1, order.total_price - discount);
  const { error } = await db.from("orders").update({ discount_code: code, discount_amount: discount, final_price: finalPrice }).eq("id", order.id).eq("status", "PENDING_PAYMENT");
  if (error) return { success: false, error: "The promo code could not be applied." };
  revalidatePath(`/checkout/${order.id}`);
  return { success: true, discount, finalPrice };
}
