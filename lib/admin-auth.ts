import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Fetches the current user + profile once per request.
 * React's cache() memoizes this across every call within the same
 * render pass, so calling it from both a layout and its child page
 * costs one DB round trip, not two.
 */
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
});

/**
 * Call at the top of any admin page/layout. Redirects non-admins,
 * returns { user, profile } for admins.
 */
export async function requireAdmin() {
  const { user, profile } = await getCurrentProfile();

  if (!user) redirect("/login");
  if (!profile || profile.role !== "ADMIN") redirect("/dashboard");

  return { user, profile };
}
