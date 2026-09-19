"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

const settingsSchema = z.object({ contact_email: z.string().trim().email().max(254), contact_phone: z.string().trim().min(5).max(40), whatsapp_number: z.string().trim().min(5).max(40) });

export async function updateSiteSettings(input: {
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please enter valid contact details." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true };
}
