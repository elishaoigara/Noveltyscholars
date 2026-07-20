import { AdminSidebar } from "./AdminSidebar";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

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
