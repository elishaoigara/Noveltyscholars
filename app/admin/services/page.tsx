import { requireAdmin } from "@/lib/admin-auth";
import { ServicesManager } from "./ServicesManager";

export default async function AdminServicesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <p className="text-muted-foreground">
          Add, edit, and remove services from your platform
        </p>
      </div>

      <ServicesManager />
    </div>
  );
}
