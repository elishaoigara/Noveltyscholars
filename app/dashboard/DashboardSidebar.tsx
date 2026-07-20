"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOutAction } from "./actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: FileText },
];

export function DashboardSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 sticky top-[110px] h-[calc(100vh-110px)] overflow-y-auto surface-sunken border-r border-border p-6 gap-2">
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Dashboard
          </h2>
          <p className="text-lg font-bold truncate text-heading">{name}</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary text-white"
                  : "text-body hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <form action={signOutAction}>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" type="submit">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-[110px] left-0 right-0 surface-raised border-b border-border z-40 px-3 py-2 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full whitespace-nowrap transition-colors",
              isActive(href) ? "bg-primary text-white" : "text-body"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
        <form action={signOutAction} className="ml-auto shrink-0">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-red-500 whitespace-nowrap px-2.5 py-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  );
}
