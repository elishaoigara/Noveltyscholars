"use client";

import { useState } from "react";
import { Tag, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { applyPromoCode } from "./actions";

export function CheckoutPromo({ orderId, initialCode, onApplied }: { orderId: string; initialCode: string | null; onApplied: (finalPrice: number, discount: number, code: string | null) => void }) {
  const [code, setCode] = useState(initialCode || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit() {
    setLoading(true); setMessage("");
    const result = await applyPromoCode(orderId, code);
    setLoading(false);
    if (!result.success) return setMessage(result.error || "Could not apply code.");
    onApplied(result.finalPrice!, result.discount!, code.trim() ? code.trim().toUpperCase() : null);
    setMessage(code.trim() ? `Code applied — you saved $${result.discount}.` : "Promo code removed.");
  }
  return <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
    <label className="text-sm font-medium flex items-center gap-2"><Tag className="h-4 w-4" /> Promo code</label>
    <div className="flex gap-2"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" maxLength={40} /><Button type="button" variant="outline" onClick={submit} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : initialCode ? "Update" : "Apply"}</Button></div>
    {message && <p className={`text-xs ${message.includes("saved") || message.includes("removed") ? "text-emerald-600" : "text-destructive"}`}>{message}</p>}
  </div>;
}
