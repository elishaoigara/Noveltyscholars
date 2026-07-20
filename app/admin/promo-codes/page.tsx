import { requireAdmin } from "@/lib/admin-auth";
import { PromoCodesManager } from "./PromoCodesManager";

export default async function AdminPromoCodesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promo Codes</h1>
        <p className="text-muted-foreground">
          Create and manage discount codes for checkout
        </p>
      </div>

      <PromoCodesManager />
    </div>
  );
}
