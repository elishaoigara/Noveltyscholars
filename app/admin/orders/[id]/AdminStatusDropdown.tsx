"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { OrderStatus } from "@/lib/types";

const statusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment Pending",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REVISION: "Revision",
};

interface AdminStatusDropdownProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function AdminStatusDropdown({
  orderId,
  currentStatus,
}: AdminStatusDropdownProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) return;
    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    } else {
      toast({
        variant: "success",
        title: "Status updated",
        description: `Order status changed to ${statusLabel[newStatus]}`,
      });
      router.refresh();
    }
    setLoading(false);
  };

  const statuses: OrderStatus[] = [
    "PENDING_PAYMENT",
    "PAID",
    "IN_PROGRESS",
    "DELIVERED",
    "COMPLETED",
    "REVISION",
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Change Status <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleChange(status)}
            disabled={status === currentStatus}
          >
            {statusLabel[status]}
            {status === currentStatus && " (current)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
