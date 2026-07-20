import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function AdminLayout({
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
    .select("role, full_name")
    .eq("id", user.id)
    .single<Pick<Profile, "role" | "full_name">>();

  if (!profile || profile.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-110px)]">
      <AdminSidebar fullName={profile.full_name} />

      {/* Main content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pt-[165px] md:pt-8 surface-sunken">
        {children}
      </div>
    </div>
  );
}
