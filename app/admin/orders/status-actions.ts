"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment Pending",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  REVISION: "Revision",
};

// Which statuses can move to which. Prevents accidental skips/regressions
// (e.g. PENDING_PAYMENT -> COMPLETED, or COMPLETED -> PENDING_PAYMENT).
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID"],
  PAID: ["IN_PROGRESS", "PENDING_PAYMENT"],
  IN_PROGRESS: ["DELIVERED", "PAID"],
  DELIVERED: ["COMPLETED", "REVISION", "IN_PROGRESS"],
  REVISION: ["IN_PROGRESS", "DELIVERED"],
  COMPLETED: ["REVISION"],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  currentStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const { user, profile } = await requireAdmin();

  if (newStatus === currentStatus) {
    return { success: false, error: "Order is already in that status." };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Can't move directly from "${STATUS_LABEL[currentStatus]}" to "${STATUS_LABEL[newStatus]}".`,
    };
  }

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Audit trail + customer notification: post a system-style note in the
  // order's chat so the customer sees the change next time they open it.
  await supabase.from("messages").insert({
    order_id: orderId,
    user_id: user.id,
    content: `📋 Order status updated to "${STATUS_LABEL[newStatus]}" by ${profile?.full_name || "Admin"}.`,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");

  return { success: true };
}
