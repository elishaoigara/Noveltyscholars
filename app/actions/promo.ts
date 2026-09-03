"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const promoInputSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  orderTotal: z.number().finite().positive().max(1_000_000),
});

export async function validatePromoCodeAction(code: string, orderTotal: number): Promise<{
  valid: boolean;
  discountAmount: number;
  finalPrice: number;
  error?: string;
}> {
  const parsed = promoInputSchema.safeParse({ code, orderTotal });
  if (!parsed.success) {
    return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "Invalid promo code" };
  }

  const supabase = createServiceClient();
  const { data: promoCode } = await supabase
    .from("promo_codes")
    .select("discount_type, discount_value, max_uses, used_count, min_order_amount, expires_at, is_active")
    .eq("code", parsed.data.code)
    .maybeSingle();

  if (!promoCode || !promoCode.is_active) {
    return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "Invalid promo code" };
  }
  if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
    return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "This promo code has expired" };
  }
  if (promoCode.max_uses > 0 && promoCode.used_count >= promoCode.max_uses) {
    return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "This promo code is no longer available" };
  }
  if (promoCode.min_order_amount > orderTotal) {
    return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "This order does not meet the minimum amount" };
  }

  const discountAmount = promoCode.discount_type === "PERCENTAGE"
    ? Math.round(orderTotal * (promoCode.discount_value / 100))
    : Math.min(promoCode.discount_value, orderTotal);
  return {
    valid: true,
    discountAmount,
    finalPrice: Math.max(0, orderTotal - discountAmount),
  };
}
