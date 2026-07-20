"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Tag, Power } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type DiscountType = "PERCENTAGE" | "FIXED";

interface PromoCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number;
  used_count: number;
  min_order_amount: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function PromoCodesManager() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);

  const codeRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const maxUsesRef = useRef<HTMLInputElement>(null);
  const minOrderRef = useRef<HTMLInputElement>(null);
  const expiresRef = useRef<HTMLInputElement>(null);
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchCodes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCodes(data as PromoCode[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    if (codeRef.current) codeRef.current.value = "";
    if (valueRef.current) valueRef.current.value = "";
    if (maxUsesRef.current) maxUsesRef.current.value = "100";
    if (minOrderRef.current) minOrderRef.current.value = "0";
    if (expiresRef.current) expiresRef.current.value = "";
    setDiscountType("PERCENTAGE");
    setIsActive(true);
    setEditingCode(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (code: PromoCode) => {
    setEditingCode(code);
    if (codeRef.current) codeRef.current.value = code.code;
    if (valueRef.current) valueRef.current.value = String(code.discount_value);
    if (maxUsesRef.current) maxUsesRef.current.value = String(code.max_uses);
    if (minOrderRef.current) minOrderRef.current.value = String(code.min_order_amount);
    if (expiresRef.current) {
      expiresRef.current.value = code.expires_at ? code.expires_at.slice(0, 10) : "";
    }
    setDiscountType(code.discount_type);
    setIsActive(code.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const code = codeRef.current?.value?.trim().toUpperCase();
    const discount_value = parseFloat(valueRef.current?.value || "0");
    const max_uses = parseInt(maxUsesRef.current?.value || "0", 10);
    const min_order_amount = parseFloat(minOrderRef.current?.value || "0");
    const expiresRaw = expiresRef.current?.value;

    if (!code || discount_value <= 0 || max_uses <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Code, discount value, and max uses are required and must be greater than 0.",
      });
      return;
    }

    if (discountType === "PERCENTAGE" && discount_value > 100) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Percentage discount can't exceed 100%.",
      });
      return;
    }

    setSaving(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      code,
      discount_type: discountType,
      discount_value,
      max_uses,
      min_order_amount,
      expires_at: expiresRaw ? new Date(expiresRaw).toISOString() : null,
      is_active: isActive,
    };

    let error;

    if (editingCode) {
      const result = await supabase
        .from("promo_codes")
        .update(payload)
        .eq("id", editingCode.id);
      error = result.error;
    } else {
      payload.used_count = 0;
      const result = await supabase.from("promo_codes").insert(payload);
      error = result.error;
    }

    if (error) {
      const isDuplicate = error.message.toLowerCase().includes("duplicate");
      toast({
        variant: "destructive",
        title: "Error",
        description: isDuplicate ? `Code "${code}" already exists.` : error.message,
      });
    } else {
      toast({
        title: editingCode ? "Promo code updated!" : "Promo code created!",
        description: `"${code}" has been saved.`,
      });
      setDialogOpen(false);
      resetForm();
      fetchCodes();
    }

    setSaving(false);
  };

  const handleToggleActive = async (promo: PromoCode) => {
    const { error } = await supabase
      .from("promo_codes")
      .update({ is_active: !promo.is_active })
      .eq("id", promo.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({
        title: promo.is_active ? "Code deactivated" : "Code activated",
        description: `"${promo.code}" is now ${promo.is_active ? "inactive" : "active"}.`,
      });
      fetchCodes();
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    if (!confirm(`Delete promo code "${promo.code}"? This cannot be undone.`)) return;

    const { error } = await supabase.from("promo_codes").delete().eq("id", promo.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Promo code deleted", description: `"${promo.code}" has been removed.` });
      fetchCodes();
    }
  };

  const isExpired = (code: PromoCode) =>
    code.expires_at ? new Date(code.expires_at) < new Date() : false;

  const isExhausted = (code: PromoCode) => code.used_count >= code.max_uses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div />
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> New Promo Code
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 border rounded-xl surface-sunken">
          <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No promo codes yet. Create your first one to enable discounts at checkout.
          </p>
        </div>
      ) : (
        <div className="surface-raised border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="hidden md:table-cell">Min Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="hidden md:table-cell">Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => {
                  const expired = isExpired(code);
                  const exhausted = isExhausted(code);
                  return (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                      <TableCell>
                        {code.discount_type === "PERCENTAGE"
                          ? `${code.discount_value}%`
                          : formatCurrency(code.discount_value)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {code.min_order_amount > 0 ? formatCurrency(code.min_order_amount) : "None"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {code.used_count} / {code.max_uses}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {code.expires_at
                          ? new Date(code.expires_at).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {!code.is_active ? (
                          <Badge variant="secondary">Inactive</Badge>
                        ) : expired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : exhausted ? (
                          <Badge variant="warning">Exhausted</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={code.is_active ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleActive(code)}
                          >
                            <Power className={`h-4 w-4 ${code.is_active ? "text-green-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(code)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCode ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
            <DialogDescription>
              Set up a discount code customers can apply at checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                ref={codeRef}
                placeholder="ESSAYHELP15"
                className="uppercase font-mono"
                disabled={!!editingCode}
              />
              {editingCode && (
                <p className="text-xs text-muted-foreground">Code can&apos;t be changed after creation.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">
                  Value * {discountType === "PERCENTAGE" ? "(%)" : "($)"}
                </Label>
                <Input
                  id="value"
                  ref={valueRef}
                  type="number"
                  min="0"
                  step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                  placeholder={discountType === "PERCENTAGE" ? "15" : "10.00"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses *</Label>
                <Input id="max_uses" ref={maxUsesRef} type="number" min="1" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_order">Min Order ($)</Label>
                <Input id="min_order" ref={minOrderRef} type="number" min="0" step="0.01" placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expiry Date (optional)</Label>
              <Input id="expires" ref={expiresRef} type="date" />
              <p className="text-xs text-muted-foreground">Leave blank for a code that never expires.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingCode ? "Update Code" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
