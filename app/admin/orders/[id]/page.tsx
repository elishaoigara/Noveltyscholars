import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusTimeline } from "@/components/StatusTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminStatusDropdown } from "./AdminStatusDropdown";
import { AdminFileUpload } from "./AdminFileUpload";
import { OrderChatWrapper } from "@/app/dashboard/orders/[id]/OrderChatWrapper";
import { OrderFilesList } from "@/app/dashboard/orders/[id]/OrderFilesList";
import type { Order, OrderFile, OrderStatus } from "@/lib/types";

const statusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment Pending",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REVISION: "Revision",
};

const statusVariant: Record<OrderStatus, "warning" | "default" | "secondary" | "success" | "destructive"> = {
  PENDING_PAYMENT: "warning",
  PAID: "default",
  IN_PROGRESS: "secondary",
  DELIVERED: "success",
  COMPLETED: "success",
  REVISION: "destructive",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile } = await requireAdmin();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, services(name), profiles!orders_user_id_fkey(email, full_name)")
    .eq("id", id)
    .single();

  if (error || !order) {
    redirect("/admin/orders");
  }

  const { data: files } = await supabase
    .from("order_files")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const orderFiles = (files || []) as OrderFile[];

  const filesWithUrls = await Promise.all(
    orderFiles.map(async (f) => {
      const { data } = await supabase.storage
        .from("order-files")
        .createSignedUrl(f.file_url, 60);
      return { ...f, signedUrl: data?.signedUrl || null };
    })
  );

  const orderData = order as Order & {
    services?: { name: string } | null;
    profiles?: { email: string; full_name: string } | null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{orderData.services?.name || "Order"}</h1>
          <p className="text-muted-foreground font-mono text-sm">
            {orderData.order_code}
          </p>
          <p className="text-sm text-muted-foreground">
            Customer: {orderData.profiles?.full_name} ({orderData.profiles?.email})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[orderData.status]} className="text-sm px-4 py-1">
            {statusLabel[orderData.status]}
          </Badge>
          <AdminStatusDropdown orderId={orderData.id} currentStatus={orderData.status} />
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardContent className="pt-6">
          <StatusTimeline currentStatus={orderData.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Subject</p>
                  <p className="font-medium">{orderData.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Topic</p>
                  <p className="font-medium">{orderData.topic}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Academic Level</p>
                  <p className="font-medium">{orderData.academic_level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pages</p>
                  <p className="font-medium">
                    {orderData.pages} pages ({orderData.words} words)
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium">{formatDate(orderData.deadline)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Price</p>
                  <p className="font-bold text-primary text-lg">
                    {formatCurrency(orderData.total_price)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-muted-foreground text-sm mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{orderData.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderFilesList files={filesWithUrls} />

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Upload Final Deliverable</p>
                <AdminFileUpload orderId={orderData.id} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          <OrderChatWrapper
            orderId={orderData.id}
            userId={user.id}
            profileName={profile.full_name || "Admin"}
          />
        </div>
      </div>
    </div>
  );
}
