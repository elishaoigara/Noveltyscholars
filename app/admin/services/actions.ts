"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().min(10).max(2_000),
  base_price: z.number().finite().positive().max(100_000),
  features: z.array(z.string().trim().min(1).max(200)).max(30),
  service_type: z.enum(["STANDARD", "ONLINE_CLASS", "ONLINE_EXAM"]),
  is_featured: z.boolean(),
});

export async function saveServiceAction(input: z.infer<typeof serviceSchema>) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid service details." };

  const { id, ...payload } = parsed.data;
  const supabase = createServiceClient();
  const result = id
    ? await supabase.from("services").update(payload).eq("id", id)
    : await supabase.from("services").insert(payload);
  return result.error
    ? { success: false, error: result.error.message }
    : { success: true };
}

export async function deleteServiceAction(id: string) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid service." };
  }
  const { error } = await createServiceClient().from("services").delete().eq("id", id);
  return error ? { success: false, error: error.message } : { success: true };
}
