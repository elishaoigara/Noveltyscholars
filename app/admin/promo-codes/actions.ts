"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

const promoSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9_-]+$/),
  discount_type: z.enum(["PERCENTAGE", "FIXED"]),
  discount_value: z.number().finite().positive(),
  max_uses: z.number().int().positive().max(1_000_000),
  min_order_amount: z.number().finite().nonnegative().max(1_000_000),
  expires_at: z.string().datetime().nullable(),
  is_active: z.boolean(),
});

export async function savePromoCodeAction(input: z.infer<typeof promoSchema>) {
  await requireAdmin();
  const parsed = promoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid promo-code details." };
  if (parsed.data.discount_type === "PERCENTAGE" && parsed.data.discount_value > 100) {
    return { success: false, error: "Percentage discounts cannot exceed 100%." };
  }

  const { id, ...payload } = parsed.data;
  const supabase = createServiceClient();
  const result = id
    ? await supabase.from("promo_codes").update(payload).eq("id", id)
    : await supabase.from("promo_codes").insert({ ...payload, used_count: 0 });
  return result.error
    ? { success: false, error: result.error.message }
    : { success: true };
}

export async function setPromoCodeActiveAction(id: string, isActive: boolean) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { success: false, error: "Invalid code." };
  const { error } = await createServiceClient()
    .from("promo_codes")
    .update({ is_active: isActive })
    .eq("id", id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deletePromoCodeAction(id: string) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { success: false, error: "Invalid code." };
  const { error } = await createServiceClient().from("promo_codes").delete().eq("id", id);
  return error ? { success: false, error: error.message } : { success: true };
}
