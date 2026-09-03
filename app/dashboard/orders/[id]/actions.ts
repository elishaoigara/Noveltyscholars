"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type StudentAction = "REVISION" | "COMPLETED";

export async function updateStudentOrderStatus(
  orderId: string,
  action: StudentAction
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "You must be signed in." };

  const serviceClient = createServiceClient();
  const { data: order, error: orderError } = await serviceClient
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (orderError || !order) return { success: false, error: "Order not found." };
  if (order.status !== "DELIVERED") {
    return { success: false, error: "This action is only available after delivery." };
  }

  const { data: updated, error: updateError } = await serviceClient
    .from("orders")
    .update({ status: action, updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "DELIVERED")
    .select("id")
    .single();

  if (updateError || !updated) {
    return { success: false, error: "The order changed before this action was completed." };
  }

  await serviceClient.from("messages").insert({
    order_id: order.id,
    user_id: user.id,
    content: action === "REVISION"
      ? "A revision was requested by the customer."
      : "The customer marked this order as completed.",
  });

  revalidatePath(`/dashboard/orders/${order.id}`);
  return { success: true };
}
