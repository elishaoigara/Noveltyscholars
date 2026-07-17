import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StudentOrderActions } from "./StudentOrderActions";
import { OrderChatWrapper } from "./OrderChatWrapper";
import { OrderFilesList } from "./OrderFilesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order, OrderFile, OrderStatus } from "@/lib/types";

const statusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment Pending",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REVISION: "Revision",
};

export default async function StudentOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch order
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, services(name)")
    .eq("id", id)
    .single();

  if (error || !order) {
    redirect("/dashboard");
  }

  // Verify ownership
  if (order.user_id !== user.id) {
    redirect("/dashboard");
  }

  // Fetch files
  const { data: files } = await supabase
    .from("order_files")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const orderFiles = (files || []) as OrderFile[];

  // Generate download signed URLs for files
  const filesWithUrls = await Promise.all(
    orderFiles.map(async (f) => {
      const { data } = await supabase.storage
        .from("order-files")
        .createSignedUrl(f.file_url, 60);
      return { ...f, signedUrl: data?.signedUrl || null };
    })
  );

  // Get profile name for chat
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const canRequestRevision = order.status === "DELIVERED";
  const canMarkComplete = order.status === "DELIVERED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.services?.name || "Order"}</h1>
          <p className="text-muted-foreground font-mono text-sm">{order.order_code}</p>
        </div>
        <Badge variant="secondary" className="text-sm px-4 py-1">
          {statusLabel[order.status]}
        </Badge>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardContent className="pt-6">
          <StatusTimeline currentStatus={order.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details - Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Subject</p>
                  <p className="font-medium">{order.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Topic</p>
                  <p className="font-medium">{order.topic}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Academic Level</p>
                  <p className="font-medium">{order.academic_level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pages</p>
                  <p className="font-medium">
                    {order.pages} pages ({order.words} words)
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium">{formatDate(order.deadline)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Price</p>
                  <p className="font-bold text-primary text-lg">
                    {formatCurrency(order.total_price)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-muted-foreground text-sm mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{order.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Files</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderFilesList files={filesWithUrls} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <StudentOrderActions
            orderId={order.id}
            orderStatus={order.status}
            canRequestRevision={canRequestRevision}
            canMarkComplete={canMarkComplete}
          />
        </div>

        {/* Chat - Right */}
        <div className="lg:col-span-1">
          <OrderChatWrapper
            orderId={order.id}
            userId={user.id}
            profileName={profile?.full_name || "You"}
          />
        </div>
      </div>
    </div>
  );
}
