import { requireAdmin } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/settings";
import { SettingsManager } from "./SettingsManager";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Contact details shown across the site — no code changes needed
        </p>
      </div>

      <SettingsManager initialSettings={settings} />
    </div>
  );
}
