"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PromoCodeInput from "@/components/PromoCodeInput";
import { calculatePrice, formatCurrency } from "@/lib/utils";

interface PricingCalculatorProps {
  basePrice: number;
  onPriceChange?: (price: number, discountInfo?: { code: string; discountAmount: number; finalPrice: number }) => void;
  showPromoCode?: boolean;
}

export function PricingCalculator({
  basePrice,
  onPriceChange,
  showPromoCode = false,
}: PricingCalculatorProps) {
  const [pages, setPages] = useState([1]);
  const [level, setLevel] = useState("High School");
  const [deadlineDays, setDeadlineDays] = useState("7");
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + parseInt(deadlineDays));
  const rawPrice = calculatePrice(basePrice, pages[0], deadline, level);
  const finalPrice = Math.max(0, rawPrice - discountAmount);

  const notifyPriceChange = () => {
    if (onPriceChange) {
      onPriceChange(finalPrice, discountCode
        ? { code: discountCode, discountAmount, finalPrice }
        : undefined
      );
    }
  };

  const handlePagesChange = (val: number[]) => {
    setPages(val);
    setTimeout(notifyPriceChange, 0);
  };

  const handleLevelChange = (val: string) => {
    setLevel(val);
    setTimeout(notifyPriceChange, 0);
  };

  const handleDeadlineChange = (val: string) => {
    setDeadlineDays(val);
    setTimeout(notifyPriceChange, 0);
  };

  const handlePromoApplied = (amount: number, final: number, code: string) => {
    setDiscountAmount(amount);
    setDiscountCode(code);
    if (onPriceChange) {
      onPriceChange(final, { code, discountAmount: amount, finalPrice: final });
    }
  };

  const handlePromoRemoved = () => {
    setDiscountAmount(0);
    setDiscountCode(null);
    if (onPriceChange) {
      onPriceChange(rawPrice);
    }
  };

  return (
    <div className="surface-raised border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 w-full max-w-md mx-auto">
      {/* Pages slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-heading">Pages</Label>
          <span className="text-sm font-semibold text-primary">{pages[0]} page(s)</span>
        </div>
        <Slider
          min={1}
          max={50}
          step={1}
          value={pages}
          onValueChange={handlePagesChange}
          className="w-full"
        />
        <p className="text-xs text-body-muted">~{pages[0] * 275} words</p>
      </div>

      {/* Academic level */}
      <div className="space-y-2">
        <Label className="text-heading">Academic Level</Label>
        <Select value={level} onValueChange={handleLevelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High School">High School</SelectItem>
            <SelectItem value="Bachelors">Bachelors</SelectItem>
            <SelectItem value="Masters">Masters</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label className="text-heading">Deadline</Label>
        <Select value={deadlineDays} onValueChange={handleDeadlineChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="5">5 days</SelectItem>
            <SelectItem value="3">3 days</SelectItem>
            <SelectItem value="2">2 days</SelectItem>
            <SelectItem value="1">24 hours</SelectItem>
            <SelectItem value="0.5">12 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Promo Code */}
      {showPromoCode && (
        <PromoCodeInput
          orderTotal={rawPrice}
          onApplied={handlePromoApplied}
          onRemoved={handlePromoRemoved}
          appliedCode={discountCode}
          discountAmount={discountAmount}
        />
      )}

      {/* Price display */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm text-body-muted">
          <span>Price per page</span>
          <span>{formatCurrency(basePrice)}</span>
        </div>
        <div className="flex justify-between text-sm text-body-muted">
          <span>Pages</span>
          <span>&times; {pages[0]}</span>
        </div>
        {discountAmount > 0 && discountCode && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount ({discountCode})</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex flex-wrap justify-between items-baseline gap-2 pt-1 border-t border-border">
          <span className="text-lg font-bold text-heading">Total</span>
          <div className="text-right">
            {discountAmount > 0 && (
              <span className="text-sm text-body-muted line-through mr-2">
                {formatCurrency(rawPrice)}
              </span>
            )}
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(finalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingCalculator;
