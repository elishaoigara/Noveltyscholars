import { redirect } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_banned")
    .eq("id", user.id)
    .single<Pick<Profile, "full_name" | "role" | "is_banned">>();

  if (profile?.is_banned) {
    await supabase.auth.signOut();
    redirect("/login?banned=1");
  }

  return (
    <div className="flex min-h-[calc(100vh-110px)]">
      <DashboardSidebar name={profile?.full_name || user.email || "Account"} />

      {/* Main content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pt-[165px] md:pt-8">
        {children}
      </div>
    </div>
  );
}
