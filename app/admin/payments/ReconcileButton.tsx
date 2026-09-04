"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { reconcilePayment } from "./actions";
export function ReconcileButton({ reference }: { reference: string }) {
  const [loading,setLoading]=useState(false); const router=useRouter(); const {toast}=useToast();
  return <Button size="sm" variant="outline" disabled={loading} onClick={async()=>{setLoading(true);const r=await reconcilePayment(reference);setLoading(false);toast(r.success?{title:"Payment reconciled"}:{variant:"destructive",title:"Not reconciled",description:r.error});router.refresh();}}><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`} />Check</Button>;
}
