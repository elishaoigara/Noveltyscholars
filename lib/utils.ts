import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";
import type { Database, PromoCode } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePrice(
  basePrice: number,
  pages: number,
  deadline: string | Date,
  level: string
): number {
  const deadlineDate = typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();
  const daysLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  let urgency = 1;
  if (daysLeft > 7) {
    urgency = 1;
  } else if (daysLeft >= 3) {
    urgency = 1.3;
  } else if (daysLeft >= 1) {
    urgency = 1.6;
  } else {
    urgency = 2.0;
  }

  let levelMult = 1;
  if (level === "High School") levelMult = 1;
  if (level === "Bachelors") levelMult = 1.2;
  if (level === "Masters") levelMult = 1.5;
  if (level === "PhD") levelMult = 2.0;

  return Math.round(basePrice * pages * urgency * levelMult);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "ORD-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validates a promo code against the database.
 * Returns validation result with discount amount and final price.
 */
export async function validatePromoCode(
  code: string,
  orderTotal: number
): Promise<{
  valid: boolean;
  discountAmount: number;
  finalPrice: number;
  error?: string;
  promoCode?: PromoCode;
}> {
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "No code provided" };
  }

  const trimmedCode = code.trim().toUpperCase();

  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: promoCode, error: fetchError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", trimmedCode)
      .single();

    if (fetchError || !promoCode) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "Invalid promo code" };
    }

    // Check if active
    if (!promoCode.is_active) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "This promo code is no longer active" };
    }

    // Check expiry
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "This promo code has expired" };
    }

    // Check max uses
    if (promoCode.max_uses > 0 && promoCode.used_count >= promoCode.max_uses) {
      return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "This promo code has reached its usage limit" };
    }

    // Check min order amount
    if (promoCode.min_order_amount > 0 && orderTotal < promoCode.min_order_amount) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: orderTotal,
        error: `Minimum order amount of ${formatCurrency(promoCode.min_order_amount)} required`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discount_type === "PERCENTAGE") {
      discountAmount = Math.round(orderTotal * (promoCode.discount_value / 100));
    } else {
      discountAmount = Math.min(promoCode.discount_value, orderTotal);
    }

    const finalPrice = Math.max(0, orderTotal - discountAmount);

    return {
      valid: true,
      discountAmount,
      finalPrice,
      promoCode: promoCode as PromoCode,
    };
  } catch {
    return { valid: false, discountAmount: 0, finalPrice: orderTotal, error: "Failed to validate promo code" };
  }
}