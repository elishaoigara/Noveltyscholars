"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator } from "lucide-react";
import { calculatePrice, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { Service } from "@/lib/types";

interface PricingCalculatorProps {
  services: Service[];
  onPriceChange?: (price: number) => void;
  defaultServiceId?: string;
  defaultPages?: number;
  defaultLevel?: string;
}

export function PricingCalculator({
  services,
  onPriceChange,
  defaultServiceId,
  defaultPages = 1,
  defaultLevel = "High School",
}: PricingCalculatorProps) {
  const [serviceId, setServiceId] = useState<string>(defaultServiceId || "");
  const [pages, setPages] = useState(defaultPages);
  const [deadline, setDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [level, setLevel] = useState(defaultLevel);
  const [price, setPrice] = useState(0);

  const selectedService = services.find((s) => s.id === serviceId);

  const calcPrice = useCallback(() => {
    if (!selectedService || !deadline) {
      setPrice(0);
      return;
    }
    const p = calculatePrice(selectedService.base_price, pages, deadline, level);
    setPrice(p);
    onPriceChange?.(p);
  }, [selectedService, pages, deadline, level, onPriceChange]);

  useEffect(() => {
    calcPrice();
  }, [calcPrice]);

  // Set tomorrow as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Max date 60 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <Card className="w-full max-w-md mx-auto card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Price Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Service */}
        <div className="space-y-2">
          <Label>Service Type</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Academic Level */}
        <div className="space-y-2">
          <Label>Academic Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Bachelors">Bachelors</SelectItem>
              <SelectItem value="Masters">Masters</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pages */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Pages: {pages}</Label>
            <span className="text-sm text-muted-foreground">
              ~{pages * 250} words
            </span>
          </div>
          <Slider
            value={[pages]}
            onValueChange={([v]) => setPages(v)}
            min={1}
            max={50}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 page</span>
            <span>50 pages</span>
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label>Deadline</Label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={minDate}
            max={maxDateStr}
          />
          <p className="text-xs text-muted-foreground">
            Earlier deadlines may increase the price due to urgency.
          </p>
        </div>

        {/* Price Display */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Estimated Price:</span>
            <span className="text-2xl font-bold text-primary">
              {price > 0 ? formatCurrency(price) : "--"}
            </span>
          </div>
          {selectedService && (
            <p className="text-xs text-muted-foreground mt-1">
              Base: {formatCurrency(selectedService.base_price)}/page &times; {pages} pages
              {level !== "High School" && ` (${level})`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
