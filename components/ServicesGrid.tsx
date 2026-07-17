import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/lib/types";

interface ServicesGridProps {
  services: Service[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="flex flex-col card-hover">
          <CardHeader>
            <CardTitle className="text-xl">{service.name}</CardTitle>
            <CardDescription className="line-clamp-2">{service.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-2xl font-bold text-primary mb-4">
              {formatCurrency(service.base_price)}
              <span className="text-sm font-normal text-muted-foreground"> / page</span>
            </p>
            {service.features && service.features.length > 0 && (
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter>
            <Link href={`/order?service=${service.id}`} className="w-full">
              <Button className="w-full">Order Now</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
