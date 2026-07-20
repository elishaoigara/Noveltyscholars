"use client";

import { useState } from "react";
import { Check, X, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePromoCode, formatCurrency } from "@/lib/utils";

interface PromoCodeInputProps {
  orderTotal: number;
  onApplied: (discountAmount: number, finalPrice: number, code: string) => void;
  onRemoved: () => void;
  appliedCode?: string | null;
  discountAmount?: number;
}

export default function PromoCodeInput({
  orderTotal,
  onApplied,
  onRemoved,
  appliedCode,
  discountAmount = 0,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await validatePromoCode(code, orderTotal);

      if (result.valid) {
        setSuccess(true);
        setError("");
        onApplied(result.discountAmount, result.finalPrice, code.trim().toUpperCase());
      } else {
        setError(result.error || "Invalid promo code");
      }
    } catch {
      setError("Failed to validate promo code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setSuccess(false);
    setError("");
    onRemoved();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  // Already applied state
  if (appliedCode && success) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-heading">Promo Code</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 rounded-lg min-w-0">
            <Tag className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-400 truncate">{appliedCode}</span>
            <Check className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto shrink-0" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-600 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400">
          Discount applied: -{formatCurrency(discountAmount)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-heading">Promo Code</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="uppercase pr-8"
            disabled={loading}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="sm:w-auto w-full"
        >
          {loading ? "Checking..." : "Apply"}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
