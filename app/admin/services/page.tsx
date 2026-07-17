import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServicesManager } from "./ServicesManager";
import type { Service, Profile } from "@/lib/types";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<Pick<Profile, "role">>();

  if (!profile || profile.role !== "ADMIN") redirect("/dashboard");

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });

  const servicesData: Service[] = (services || []).map((s) => ({
    ...s,
    features: Array.isArray(s.features) ? s.features : [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <p className="text-muted-foreground">
          Add, edit, and remove services from your platform
        </p>
      </div>

      <ServicesManager services={servicesData} />
    </div>
  );
}
