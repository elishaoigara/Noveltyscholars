"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type VerificationState = "verifying" | "success" | "pending" | "error";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [state, setState] = useState<VerificationState>("verifying");
  const [message, setMessage] = useState("Confirming your payment with Paystack...");
  const [orderId, setOrderId] = useState<string | null>(null);

  const verifyPayment = useCallback(async () => {
    if (!reference) {
      setState("error");
      setMessage("The payment reference is missing. Please return to your order and try again.");
      return;
    }

    setState("verifying");
    setMessage("Confirming your payment with Paystack...");

    try {
      const response = await fetch(
        `/api/payment/paystack/verify?reference=${encodeURIComponent(reference)}`,
        { cache: "no-store" }
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setOrderId(result.orderId);
        setState("success");
        setMessage("Your payment has been confirmed and your order is ready for processing.");
        return;
      }

      if (result.pending) {
        setState("pending");
        setMessage("Paystack has not confirmed this payment yet. Wait a moment, then try again.");
        return;
      }

      throw new Error(result.error || "Payment verification failed");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Payment verification failed");
    }
  }, [reference]);

  useEffect(() => {
    void verifyPayment();
  }, [verifyPayment]);

  const icon =
    state === "verifying" ? (
      <Loader2 className="h-14 w-14 animate-spin text-primary" />
    ) : state === "success" ? (
      <CheckCircle2 className="h-14 w-14 text-green-500" />
    ) : (
      <XCircle className="h-14 w-14 text-amber-500" />
    );

  return (
    <div className="container mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12">
      <Card className="w-full text-center">
        <CardHeader className="items-center gap-4">
          {icon}
          <CardTitle>
            {state === "verifying"
              ? "Verifying payment"
              : state === "success"
                ? "Payment confirmed"
                : state === "pending"
                  ? "Confirmation pending"
                  : "Verification problem"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{message}</p>
          {reference && (
            <p className="mt-4 break-all font-mono text-xs text-muted-foreground">
              Reference: {reference}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col justify-center gap-3 sm:flex-row">
          {state === "success" && orderId ? (
            <><Button asChild><Link href={`/dashboard/orders/${orderId}`}>View order</Link></Button>{reference&&<Button asChild variant="outline"><Link href={`/dashboard/receipts/${encodeURIComponent(reference)}`}>View receipt</Link></Button>}</>
          ) : state !== "verifying" ? (
            <Button onClick={verifyPayment} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try verification again
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
