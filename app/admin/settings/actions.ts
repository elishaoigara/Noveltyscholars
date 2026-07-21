"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function updateSiteSettings(input: {
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  if (!input.contact_email || !input.contact_phone || !input.whatsapp_number) {
    return { success: false, error: "All fields are required." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...input, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true };
}
