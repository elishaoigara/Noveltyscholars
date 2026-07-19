"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, Settings, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type ServiceType = "STANDARD" | "ONLINE_CLASS" | "ONLINE_EXAM";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  features: string[];
  service_type: ServiceType;
  is_featured: boolean;
  created_at: string;
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [featuresInput, setFeaturesInput] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [serviceType, setServiceType] = useState<ServiceType>("STANDARD");
  const [isFeatured, setIsFeatured] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) {
      setServices(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((s: any) => ({
          ...s,
          features: Array.isArray(s.features) ? s.features : [],
          service_type: (s.service_type as ServiceType) || "STANDARD",
          is_featured: !!s.is_featured,
        })) as Service[]
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    if (nameRef.current) nameRef.current.value = "";
    if (slugRef.current) slugRef.current.value = "";
    if (descRef.current) descRef.current.value = "";
    if (priceRef.current) priceRef.current.value = "";
    setFeaturesInput("");
    setServiceType("STANDARD");
    setIsFeatured(false);
    setEditingService(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    if (nameRef.current) nameRef.current.value = service.name;
    if (slugRef.current) slugRef.current.value = service.slug;
    if (descRef.current) descRef.current.value = service.description;
    if (priceRef.current) priceRef.current.value = String(service.base_price);
    setFeaturesInput(service.features.join(", "));
    setServiceType(service.service_type || "STANDARD");
    setIsFeatured(!!service.is_featured);
    setDialogOpen(true);
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = () => {
    const name = nameRef.current?.value || "";
    if (!editingService && slugRef.current) {
      slugRef.current.value = generateSlug(name);
    }
  };

  const handleSave = async () => {
    const name = nameRef.current?.value?.trim();
    const slug = slugRef.current?.value?.trim();
    const description = descRef.current?.value?.trim();
    const base_price = parseFloat(priceRef.current?.value || "0");

    if (!name || !slug || !description || base_price <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required and price must be greater than 0.",
      });
      return;
    }

    setSaving(true);

    const features = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      name,
      slug,
      description,
      base_price,
      features,
      service_type: serviceType,
      is_featured: isFeatured,
    };

    let error;

    if (editingService) {
      const result = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingService.id);
      error = result.error;
    } else {
      const result = await supabase.from("services").insert(payload);
      error = result.error;
    }

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({
        title: editingService ? "Service updated!" : "Service created!",
        description: `"${name}" has been saved.`,
      });
      setDialogOpen(false);
      resetForm();
      fetchServices();
    }

    setSaving(false);
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Delete service "${service.name}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Service deleted", description: `"${service.name}" has been removed.` });
      fetchServices();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your academic writing services</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-gray-50">
          <Settings className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No services yet. Create your first one!</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price/page</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">/{service.slug}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        service.service_type === "ONLINE_CLASS"
                          ? "bg-indigo-100 text-indigo-700"
                          : service.service_type === "ONLINE_EXAM"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {service.service_type === "ONLINE_CLASS"
                        ? "Online Class"
                        : service.service_type === "ONLINE_EXAM"
                        ? "Online Exam"
                        : "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatCurrency(service.base_price)}
                  </TableCell>
                  <TableCell>
                    {service.is_featured && (
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Create Service"}</DialogTitle>
            <DialogDescription>Add or edit an academic writing service.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input id="name" ref={nameRef} onChange={handleNameChange} placeholder="e.g., Essay Writing" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" ref={slugRef} placeholder="essay-writing" disabled={!!editingService} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" ref={descRef} rows={3} placeholder="Brief description of the service" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price ($ per page) *</Label>
                <Input id="base_price" ref={priceRef} type="number" min="1" step="0.01" placeholder="15.00" />
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={serviceType} onValueChange={(val) => setServiceType(val as ServiceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard (Essay)</SelectItem>
                    <SelectItem value="ONLINE_CLASS">Online Class</SelectItem>
                    <SelectItem value="ONLINE_EXAM">Online Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="24/7 Support, Free Revisions, Plagiarism Report"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isFeatured" className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-400" /> Featured Service
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingService ? "Update Service" : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ServicesManager;