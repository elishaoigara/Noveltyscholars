"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw, CheckCircle2, Loader2, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cancelUnpaidOrder, updateStudentOrderStatus } from "./actions";

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
  const { toast } = useToast();

  const handleAction = async (action: "REVISION" | "COMPLETED") => {
    setLoading(action);
    const result = await updateStudentOrderStatus(orderId, action);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: result.error,
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
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="gap-2"><Link href={`/checkout/${orderId}`}><CreditCard className="h-4 w-4" />Resume payment</Link></Button>
        <Button variant="outline" className="gap-2" disabled={loading !== null} onClick={async () => { if (!window.confirm("Cancel this unpaid order?")) return; setLoading("CANCELLED"); const result = await cancelUnpaidOrder(orderId); setLoading(null); if (!result.success) toast({ variant: "destructive", title: "Cancellation failed", description: result.error }); else { toast({ title: "Order cancelled" }); router.refresh(); } }}>
          {loading === "CANCELLED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}Cancel unpaid order
        </Button>
      </div>
    );
  }

  if (orderStatus === "CANCELLED") return <p className="text-sm text-muted-foreground">This unpaid order was cancelled.</p>;

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
