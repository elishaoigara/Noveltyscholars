"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function updateUserRole(
  userId: string,
  newRole: "STUDENT" | "ADMIN"
): Promise<{ success: boolean; error?: string }> {
  const { user } = await requireAdmin();

  if (userId === user.id && newRole === "STUDENT") {
    return {
      success: false,
      error: "You can't demote your own account. Ask another admin to do it.",
    };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserBan(
  userId: string,
  banned: boolean
): Promise<{ success: boolean; error?: string }> {
  const { user } = await requireAdmin();

  if (userId === user.id) {
    return { success: false, error: "You can't ban your own account." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: banned })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}
