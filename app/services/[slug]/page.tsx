import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/types";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const service = data as Service;
  const features: string[] = Array.isArray(service.features) ? service.features : [];

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/#services" className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; Back to Services
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-3">{service.name}</h1>
      <p className="text-lg text-gray-600 mb-6">{service.description}</p>

      <div className="bg-primary/5 rounded-2xl p-6 mb-8 inline-block">
        <span className="text-3xl font-bold text-primary">
          {formatCurrency(service.base_price)}
        </span>
        <span className="text-muted-foreground"> / page</span>
      </div>

      {features.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">What&apos;s Included</h2>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href={`/order?service=${service.id}`}>
        <Button size="lg" className="gap-2">
          Order This Service
        </Button>
      </Link>
    </div>
  );
}
