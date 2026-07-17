import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
