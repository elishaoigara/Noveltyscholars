"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus } from "./status-actions";
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

const ALL_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "REVISION",
];

interface AdminOrdersTableProps {
  orders: (Order & {
    services?: { name: string } | null;
    profiles?: { email: string; full_name: string } | null;
  })[];
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Status filter lives in the URL (?status=PAID) so it's shareable/bookmarkable
  // and survives a refresh.
  const statusFilter = searchParams.get("status") || "all";

  const setStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    startTransition(() => {
      router.push(`/admin/orders${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.order_code.toLowerCase().includes(search.toLowerCase()) ||
      order.subject.toLowerCase().includes(search.toLowerCase()) ||
      (order.profiles?.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const result = await updateOrderStatus(orderId, newStatus, currentStatus);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: result.error,
      });
    } else {
      toast({
        variant: "success",
        title: "Status updated",
        description: `Order status changed to ${statusLabel[newStatus]}`,
      });
      router.refresh();
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order code, subject, or email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isPending}>
          <SelectTrigger className="w-full sm:w-[180px]">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue placeholder="Filter by status" />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="surface-raised rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border surface-sunken text-sm text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium">Order Code</th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                  Subject
                </th>
                <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">
                  Deadline
                </th>
                <th className="text-left py-3 px-4 font-medium">Price</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 text-sm hover:bg-primary/5">
                    <td className="py-3 px-4 font-mono text-xs">{order.order_code}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{order.profiles?.full_name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.profiles?.email || "N/A"}
                      </p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell truncate max-w-[150px]">
                      {order.services?.name || order.subject}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {formatDate(order.deadline)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(order.total_price)}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button disabled={updatingId === order.id}>
                            {updatingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Badge
                                variant={statusVariant[order.status]}
                                className="cursor-pointer"
                              >
                                {statusLabel[order.status]}
                              </Badge>
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {ALL_STATUSES.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(order.id, order.status, status)}
                              disabled={order.status === status}
                            >
                              {statusLabel[status]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
