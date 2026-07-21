import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: "noveltyscholars@gmail.com",
  contact_phone: "+1 (209) 560-0466",
  whatsapp_number: "12095600466",
};

/**
 * Reads the singleton site_settings row. Falls back to hardcoded
 * defaults if the table doesn't exist yet or the row hasn't been
 * created — so nothing breaks before the migration runs.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("contact_email, contact_phone, whatsapp_number")
      .eq("id", 1)
      .single();

    if (error || !data) return DEFAULT_SETTINGS;

    return {
      contact_email: data.contact_email || DEFAULT_SETTINGS.contact_email,
      contact_phone: data.contact_phone || DEFAULT_SETTINGS.contact_phone,
      whatsapp_number: data.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
});
