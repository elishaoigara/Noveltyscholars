import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { UsersManager } from "./UsersManager";

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total_price, status");

  const statsByUser = new Map<string, { orderCount: number; totalSpent: number }>();
  for (const order of orders || []) {
    const existing = statsByUser.get(order.user_id) || { orderCount: 0, totalSpent: 0 };
    existing.orderCount += 1;
    if (order.status !== "PENDING_PAYMENT") {
      existing.totalSpent += order.total_price || 0;
    }
    statsByUser.set(order.user_id, existing);
  }

  const usersWithStats = (profiles || []).map((p) => ({
    ...p,
    orderCount: statsByUser.get(p.id)?.orderCount || 0,
    totalSpent: statsByUser.get(p.id)?.totalSpent || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          View registered users, manage roles, and see order history at a glance
        </p>
      </div>

      <UsersManager users={usersWithStats} />
    </div>
  );
}
