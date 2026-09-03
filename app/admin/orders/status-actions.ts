"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
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

async function applyStatusUpdate(
  orderId: string,
  newStatus: OrderStatus,
  user: { id: string },
  profile: { full_name: string } | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) return { success: false, error: "Order not found." };
  const currentStatus = order.status;

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

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", currentStatus)
    .select("id")
    .single();

  if (updateError || !updated) {
    return { success: false, error: "The order status changed. Refresh and try again." };
  }

  await supabase.from("messages").insert({
    order_id: orderId,
    user_id: user.id,
    content: `📋 Order status updated to "${STATUS_LABEL[newStatus]}" by ${profile?.full_name || "Admin"}.`,
  });

  return { success: true };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const { user, profile } = await requireAdmin();

  const result = await applyStatusUpdate(orderId, newStatus, user, profile);

  if (result.success) {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
  }

  return result;
}

/**
 * Applies a status change to multiple orders at once. Each order is
 * validated independently against the same transition rules — orders
 * that can't legally make the move are skipped and reported back,
 * rather than failing the whole batch.
 */
export async function bulkUpdateOrderStatus(
  orders: { id: string; status: OrderStatus }[],
  newStatus: OrderStatus
): Promise<{ updated: number; skipped: number; errors: string[] }> {
  const { user, profile } = await requireAdmin();

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const order of orders) {
    const result = await applyStatusUpdate(order.id, newStatus, user, profile);
    if (result.success) {
      updated += 1;
      revalidatePath(`/admin/orders/${order.id}`);
    } else {
      skipped += 1;
      if (result.error) errors.push(result.error);
    }
  }

  if (updated > 0) {
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
  }

  return { updated, skipped, errors };
}
