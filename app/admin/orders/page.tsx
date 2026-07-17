import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminOrdersTable } from "./AdminOrdersTable";
import type { Order, OrderStatus } from "@/lib/types";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") redirect("/dashboard");

  // Fetch all orders with user email
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
