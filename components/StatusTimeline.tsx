"use client";

import { Check, Clock, FileText, Loader2, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const steps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "PENDING_PAYMENT", label: "Payment Pending", icon: <Clock className="h-5 w-5" /> },
  { status: "PAID", label: "Payment Confirmed", icon: <CheckCircle2 className="h-5 w-5" /> },
  { status: "IN_PROGRESS", label: "In Progress", icon: <Loader2 className="h-5 w-5" /> },
  { status: "DELIVERED", label: "Delivered", icon: <Send className="h-5 w-5" /> },
  { status: "COMPLETED", label: "Completed", icon: <Check className="h-5 w-5" /> },
];

const statusOrder: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
];

interface StatusTimelineProps {
  currentStatus: OrderStatus;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  // Handle REVISION as a special case - show as DELIVERED but with note
  const effectiveStatus: OrderStatus =
    currentStatus === "REVISION" ? "DELIVERED" : currentStatus;

  const currentIndex = statusOrder.indexOf(effectiveStatus);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const stepStatus = statusOrder.indexOf(step.status);
          const isCompleted = stepStatus < currentIndex;
          const isCurrent = stepStatus === currentIndex;
          const isFuture = stepStatus > currentIndex;

          return (
            <div key={step.status} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -z-0">
                  <div
                    className={cn(
                      "h-full transition-colors duration-500",
                      isCompleted ? "bg-primary" : "bg-gray-200"
                    )}
                  />
                </div>
              )}

              {/* Circle */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted && "bg-primary border-primary text-white",
                  isCurrent && "bg-primary/10 border-primary text-primary",
                  isFuture && "bg-white border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : isCurrent && step.status === "IN_PROGRESS" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "mt-2 text-xs text-center font-medium transition-colors",
                  isCompleted && "text-primary",
                  isCurrent && "text-primary font-semibold",
                  isFuture && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {currentStatus === "REVISION" && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            <FileText className="h-3 w-3" />
            Revision Requested
          </span>
        </div>
      )}
    </div>
  );
}
