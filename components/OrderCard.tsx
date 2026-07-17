import Link from "next/link";
import { Calendar, FileText, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
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

interface OrderCardProps {
  order: Order & {
    services?: { name: string } | null;
  };
  showActions?: boolean;
  adminView?: boolean;
}

export function OrderCard({ order, showActions = true, adminView = false }: OrderCardProps) {
  const detailUrl = adminView
    ? `/admin/orders/${order.id}`
    : `/dashboard/orders/${order.id}`;

  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs text-muted-foreground font-mono">{order.order_code}</span>
            <h3 className="font-semibold text-sm mt-0.5">
              {order.services?.name || "Order"}
            </h3>
          </div>
          <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Subject</p>
            <p className="font-medium truncate">{order.subject}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Topic</p>
            <p className="font-medium truncate">{order.topic}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{order.pages} pages ({order.words} words)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatDate(order.deadline)}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-primary">
              {formatCurrency(order.total_price)}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="mt-4 pt-3 border-t">
            <Link href={detailUrl}>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
