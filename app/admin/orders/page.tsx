import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { AdminOrdersTable } from "./AdminOrdersTable";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, services(name), profiles!orders_user_id_fkey(email, full_name)")
    .order("created_at", { ascending: false });

  const ordersList = (orders || []) as (Order & {
    services?: { name: string } | null;
    profiles?: { email: string; full_name: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <p className="text-muted-foreground">
          View and manage all orders on the platform
        </p>
      </div>

      <AdminOrdersTable orders={ordersList} />
    </div>
  );
}
