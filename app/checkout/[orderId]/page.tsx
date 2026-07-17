"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Shield, CreditCard, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Order, Profile } from "@/lib/types";

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<(Order & { services?: { name: string } | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function loadOrder() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, services(name)")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Order not found",
          description: "Could not find this order.",
        });
        router.push("/dashboard");
        return;
      }

      // Verify ownership
      if (data.user_id !== user.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single<Pick<Profile, "role">>();

        if (!profile || profile.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
      }

      setOrder(data);
      setLoading(false);
    }
    loadOrder();
  }, [orderId, supabase, router, toast]);

  const handleMockPayment = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/payment/mock-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const result = await res.json();

      if (result.success) {
        toast({
          variant: "success",
          title: "Payment successful!",
          description: "Your order is now being processed.",
        });
        router.push(`/dashboard/orders/${orderId}`);
        router.refresh();
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: message,
      });
    }
    setPaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Review and pay for your order</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {order.services?.name || "Order"}
            </CardTitle>
            <Badge variant="warning">Payment Pending</Badge>
          </div>
          <CardDescription className="font-mono">{order.order_code}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Subject</p>
              <p className="font-medium">{order.subject}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Topic</p>
              <p className="font-medium">{order.topic}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Academic Level</p>
              <p className="font-medium">{order.academic_level}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pages</p>
              <p className="font-medium">
                {order.pages} pages ({order.words} words)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium">{formatDate(order.deadline)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Price</p>
              <p className="font-bold text-primary text-lg">
                {formatCurrency(order.total_price)}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3 border-t pt-6">
          {/* Mock Payment Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleMockPayment}
            disabled={paying}
          >
            {paying ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay Now - {formatCurrency(order.total_price)}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            This is a mock payment for demonstration purposes.
            {/* TODO: Replace with Razorpay/Stripe - User will integrate */}
          </p>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Secure payment &amp; 100% satisfaction guaranteed</span>
      </div>
    </div>
  );
}
