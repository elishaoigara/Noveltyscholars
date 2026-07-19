import { Calculator, Zap, BookOpen, GraduationCap } from "lucide-react";
import { PricingCalculator } from "@/components/PricingCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Transparent pricing based on your requirements. Use the calculator below
          to get an instant estimate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Calculator */}
        <PricingCalculator basePrice={15} showPromoCode />

        {/* Pricing Factors */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">How Pricing Works</h2>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Number of Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Each page is approximately 250 words. The more pages you need, the
                higher the total cost. We charge per page based on the service type.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Urgency (Deadline)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tighter deadlines are charged at a premium due to the faster turnaround
                required. Orders with 7+ days notice are charged at the base rate.
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>More than 7 days</span>
                  <span className="font-medium">Base rate (1x)</span>
                </div>
                <div className="flex justify-between">
                  <span>3 - 7 days</span>
                  <span className="font-medium">+30% urgency</span>
                </div>
                <div className="flex justify-between">
                  <span>1 - 3 days</span>
                  <span className="font-medium">+60% urgency</span>
                </div>
                <div className="flex justify-between">
                  <span>Less than 24 hours</span>
                  <span className="font-medium">+100% urgency</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Academic Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Higher academic levels require more expertise and research depth, which
                affects the pricing.
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>High School</span>
                  <span className="font-medium">Base rate (1x)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bachelors</span>
                  <span className="font-medium">1.2x multiplier</span>
                </div>
                <div className="flex justify-between">
                  <span>Masters</span>
                  <span className="font-medium">1.5x multiplier</span>
                </div>
                <div className="flex justify-between">
                  <span>PhD</span>
                  <span className="font-medium">2.0x multiplier</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            <Calculator className="h-4 w-4 inline mr-1" />
            Formula: Base Price &times; Pages &times; Urgency Multiplier &times; Level
            Multiplier
          </div>
        </div>
      </div>
    </div>
  );
}