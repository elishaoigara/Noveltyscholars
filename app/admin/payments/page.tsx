import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconcileButton } from "./ReconcileButton";

export default async function AdminPaymentsPage() {
  await requireAdmin(); const db=createServiceClient();
  const [{data:payments},{data:events}] = await Promise.all([
    db.from("payments").select("*").order("created_at",{ascending:false}).limit(200),
    db.from("payment_events").select("*").order("created_at",{ascending:false}).limit(30),
  ]);
  const rows=payments||[]; const total=(s:string)=>rows.filter(p=>p.status===s).length;
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Payments</h1><p className="text-muted-foreground">Monitor Paystack transactions, failures and reconciliation.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">{[["Successful",total("SUCCESS")],["Pending",total("PENDING")+total("INITIALIZED")],["Failed",total("FAILED")]].map(([l,v])=><Card key={l}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{l}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{v}</CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Transactions</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-3">Reference</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>{rows.map(p=><tr key={p.id} className="border-b"><td className="py-3 font-mono text-xs">{p.reference}</td><td>{formatCurrency((p.amount_paid??p.expected_amount)/100)}</td><td><Badge variant={p.status==="SUCCESS"?"success":p.status==="FAILED"?"destructive":"warning"}>{p.status}</Badge></td><td>{formatDate(p.created_at)}</td><td>{p.status!=="SUCCESS"&&<ReconcileButton reference={p.reference}/>}</td></tr>)}</tbody></table>{!rows.length&&<p className="py-8 text-center text-muted-foreground">No transactions yet.</p>}</CardContent></Card>
    <Card><CardHeader><CardTitle>Webhook &amp; reconciliation events</CardTitle></CardHeader><CardContent className="space-y-3">{(events||[]).map(e=><div key={e.id} className="rounded-lg border p-3 text-sm"><div className="flex justify-between gap-3"><strong>{e.event_type.replaceAll("_"," ")}</strong><Badge variant={e.status==="FAILED"?"destructive":e.status==="SUCCESS"?"success":"secondary"}>{e.source}</Badge></div><p className="font-mono text-xs text-muted-foreground">{e.reference||"No reference"}</p>{e.error_message&&<p className="text-destructive">{e.error_message}</p>}</div>)}</CardContent></Card>
  </div>;
}
