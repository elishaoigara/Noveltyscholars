"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StudentOrderActionsProps {
  orderId: string;
  orderStatus: string;
  canRequestRevision: boolean;
  canMarkComplete: boolean;
}

export function StudentOrderActions({
  orderId,
  orderStatus,
  canRequestRevision,
  canMarkComplete,
}: StudentOrderActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleAction = async (action: "REVISION" | "COMPLETED") => {
    setLoading(action);
    const { error } = await supabase
      .from("orders")
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: error.message,
      });
    } else {
      toast({
        variant: "success",
        title: "Success!",
        description:
          action === "REVISION"
            ? "Revision requested. Your writer will update the paper."
            : "Order completed. Thank you!",
      });
      router.refresh();
    }
    setLoading(null);
  };

  if (orderStatus === "PENDING_PAYMENT") {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        Complete payment to unlock more actions.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {canRequestRevision && (
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => handleAction("REVISION")}
          disabled={loading !== null}
        >
          {loading === "REVISION" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Request Revision
        </Button>
      )}
      {canMarkComplete && (
        <Button
          className="gap-2"
          onClick={() => handleAction("COMPLETED")}
          disabled={loading !== null}
        >
          {loading === "COMPLETED" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Mark as Complete
        </Button>
      )}
      {!canRequestRevision && !canMarkComplete && orderStatus !== "PENDING_PAYMENT" && (
        <p className="text-sm text-muted-foreground">
          {orderStatus === "COMPLETED"
            ? "This order has been completed."
            : orderStatus === "REVISION"
            ? "Your revision is being processed."
            : orderStatus === "IN_PROGRESS"
            ? "Your order is being worked on."
            : orderStatus === "PAID"
            ? "Your order will be assigned to a writer soon."
            : ""}
        </p>
      )}
    </div>
  );
}
