import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment Pending",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REVISION: "Revision",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-400",
  PAID: "bg-blue-400",
  IN_PROGRESS: "bg-indigo-400",
  DELIVERED: "bg-teal-400",
  COMPLETED: "bg-green-500",
  REVISION: "bg-red-400",
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("total_price, status, service_id, created_at, services(name, service_type)");

  const allOrders = orders || [];
  const paidOrders = allOrders.filter((o) => o.status !== "PENDING_PAYMENT");

  // Revenue by month — last 6 months
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  const revenueByMonth = new Map<string, number>(months.map((m) => [m, 0]));
  for (const order of paidOrders) {
    const key = monthKey(new Date(order.created_at));
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + (order.total_price || 0));
    }
  }
  const maxMonthRevenue = Math.max(1, ...Array.from(revenueByMonth.values()));

  // Orders by status
  const statusCounts = new Map<OrderStatus, number>();
  for (const order of allOrders) {
    statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1);
  }
  const maxStatusCount = Math.max(1, ...Array.from(statusCounts.values()));

  // Orders by service
  const serviceCounts = new Map<string, { count: number; revenue: number }>();
  for (const order of paidOrders) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceName = (order.services as any)?.name || "Unknown Service";
    const existing = serviceCounts.get(serviceName) || { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += order.total_price || 0;
    serviceCounts.set(serviceName, existing);
  }
  const topServices = Array.from(serviceCounts.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6);
  const maxServiceRevenue = Math.max(1, ...topServices.map(([, v]) => v.revenue));

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Revenue and order trends at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lifetime Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders (Paid+)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paidOrders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue — Last 6 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-4">
            {months.map((m) => {
              const revenue = revenueByMonth.get(m) || 0;
              const heightPct = Math.max(4, (revenue / maxMonthRevenue) * 100);
              return (
                <div key={m} className="flex flex-col items-center flex-1 h-full justify-end gap-2">
                  <span className="text-xs font-medium text-heading">
                    {revenue > 0 ? formatCurrency(revenue) : ""}
                  </span>
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full max-w-10 sm:max-w-12 bg-primary rounded-t-md transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{monthLabel(m)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(STATUS_LABEL) as OrderStatus[])
              .filter((s) => (statusCounts.get(s) || 0) > 0)
              .map((status) => {
                const count = statusCounts.get(status) || 0;
                const widthPct = (count / maxStatusCount) * 100;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-body">{STATUS_LABEL[status]}</span>
                      <span className="font-medium text-heading">{count}</span>
                    </div>
                    <div className="h-2 rounded-full surface-sunken overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLOR[status]}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            {allOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Top services by revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Services by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topServices.length === 0 && (
              <p className="text-sm text-muted-foreground">No paid orders yet.</p>
            )}
            {topServices.map(([name, stats]) => {
              const widthPct = (stats.revenue / maxServiceRevenue) * 100;
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-body truncate max-w-[60%]">{name}</span>
                    <span className="font-medium text-heading">
                      {formatCurrency(stats.revenue)} &middot; {stats.count} order{stats.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 rounded-full surface-sunken overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
