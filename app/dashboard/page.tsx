import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Clock, CheckCircle2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/lib/types";

const statusVariant: Record<OrderStatus, "warning" | "default" | "secondary" | "success" | "destructive"> = {
  PENDING_PAYMENT: "warning",
  PAID: "default",
  IN_PROGRESS: "secondary",
  DELIVERED: "success",
  COMPLETED: "success",
  REVISION: "destructive",
};

const statusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment Pending",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REVISION: "Revision",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*, services(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ordersList = (orders || []) as (Order & { services?: { name: string } | null })[];

  const total = ordersList.length;
  const inProgress = ordersList.filter(
    (o) => o.status === "PAID" || o.status === "IN_PROGRESS" || o.status === "REVISION"
  ).length;
  const completed = ordersList.filter(
    (o) => o.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your orders and track progress</p>
        </div>
        <Link href="/order">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersList.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet.</p>
              <Link href="/order">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Place Your First Order
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="text-left py-3 font-medium">Order Code</th>
                    <th className="text-left py-3 font-medium">Subject</th>
                    <th className="text-left py-3 font-medium hidden md:table-cell">
                      Deadline
                    </th>
                    <th className="text-left py-3 font-medium hidden md:table-cell">
                      Price
                    </th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-right py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 text-sm">
                      <td className="py-3 font-mono text-xs">{order.order_code}</td>
                      <td className="py-3 truncate max-w-[150px]">
                        {order.services?.name || order.subject}
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        {formatDate(order.deadline)}
                      </td>
                      <td className="py-3 hidden md:table-cell font-medium">
                        {formatCurrency(order.total_price)}
                      </td>
                      <td className="py-3">
                        <Badge variant={statusVariant[order.status]}>
                          {statusLabel[order.status]}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
