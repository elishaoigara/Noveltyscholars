"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Download, X } from "lucide-react";
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
import { updateOrderStatus, bulkUpdateOrderStatus } from "./status-actions";
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

type OrderRow = Order & {
  services?: { name: string } | null;
  profiles?: { email: string; full_name: string } | null;
};

interface AdminOrdersTableProps {
  orders: OrderRow[];
}

function downloadCsv(rows: OrderRow[]) {
  const headers = [
    "Order Code",
    "Customer Name",
    "Customer Email",
    "Service",
    "Subject",
    "Academic Level",
    "Pages",
    "Words",
    "Deadline",
    "Status",
    "Total Price",
    "Created At",
  ];

  const escape = (val: string | number) => {
    const str = String(val ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((o) =>
      [
        o.order_code,
        o.profiles?.full_name || "",
        o.profiles?.email || "",
        o.services?.name || "",
        o.subject,
        o.academic_level,
        o.pages,
        o.words,
        o.deadline ? new Date(o.deadline).toLocaleDateString() : "",
        statusLabel[o.status],
        o.total_price,
        new Date(o.created_at).toLocaleDateString(),
      ]
        .map(escape)
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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

  const allVisibleSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach((o) => next.delete(o.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((o) => next.add(o.id));
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const result = await updateOrderStatus(orderId, newStatus, currentStatus);

    if (!result.success) {
      toast({ variant: "destructive", title: "Update failed", description: result.error });
    } else {
      toast({ variant: "success", title: "Status updated", description: `Order status changed to ${statusLabel[newStatus]}` });
      router.refresh();
    }
    setUpdatingId(null);
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    const selectedOrders = orders
      .filter((o) => selected.has(o.id))
      .map((o) => ({ id: o.id, status: o.status }));

    if (selectedOrders.length === 0) return;

    setBulkLoading(true);
    const result = await bulkUpdateOrderStatus(selectedOrders, newStatus);
    setBulkLoading(false);

    if (result.updated > 0) {
      toast({
        variant: "success",
        title: `${result.updated} order${result.updated > 1 ? "s" : ""} updated`,
        description:
          result.skipped > 0
            ? `${result.skipped} order${result.skipped > 1 ? "s" : ""} couldn't be moved to ${statusLabel[newStatus]} (illegal transition) and were skipped.`
            : `All selected orders moved to ${statusLabel[newStatus]}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "No orders updated",
        description: `None of the selected orders can move to ${statusLabel[newStatus]} from their current status.`,
      });
    }

    setSelected(new Set());
    router.refresh();
  };

  const handleExport = () => {
    const rows = selected.size > 0 ? orders.filter((o) => selected.has(o.id)) : filtered;
    downloadCsv(rows);
    toast({
      variant: "success",
      title: "Export ready",
      description: `${rows.length} order${rows.length === 1 ? "" : "s"} exported to CSV.`,
    });
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
        <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV{selected.size > 0 ? ` (${selected.size})` : ""}
        </Button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium">
            {selected.size} order{selected.size > 1 ? "s" : ""} selected
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={bulkLoading} className="gap-2">
                {bulkLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Move to status...
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {ALL_STATUSES.map((status) => (
                <DropdownMenuItem key={status} onClick={() => handleBulkStatusChange(status)}>
                  {statusLabel[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={() => setSelected(new Set())}
          >
            <X className="h-3.5 w-3.5" />
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="surface-raised rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border surface-sunken text-sm text-muted-foreground">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                    aria-label="Select all visible orders"
                  />
                </th>
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
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 text-sm hover:bg-primary/5">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleSelectOne(order.id)}
                        className="rounded border-gray-300"
                        aria-label={`Select order ${order.order_code}`}
                      />
                    </td>
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
                              <Badge variant={statusVariant[order.status]} className="cursor-pointer">
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
