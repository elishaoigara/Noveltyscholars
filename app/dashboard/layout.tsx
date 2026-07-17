import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function signOutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

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
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-[80vh] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r p-6 gap-2">
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Dashboard
          </h2>
          <p className="text-lg font-bold truncate">
            {profile?.full_name || user.email}
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <FileText className="h-4 w-4" />
            My Orders
          </Link>
        </nav>

        <form action={signOutAction}>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" type="submit">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b z-40 px-4 py-2 flex gap-4 overflow-x-auto">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm font-medium whitespace-nowrap"
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </Link>
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1 text-sm font-medium whitespace-nowrap"
        >
          <FileText className="h-4 w-4" />
          My Orders
        </Link>
        <form action={signOutAction} className="ml-auto">
          <button type="submit" className="flex items-center gap-1 text-sm text-red-600 whitespace-nowrap">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8 pt-16 md:pt-8">{children}</div>
    </div>
  );
}
