"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/lib/types";

const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  base_price: z.coerce.number().min(1, "Price must be at least $1"),
  features: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

interface ServicesManagerProps {
  services: Service[];
}

export function ServicesManager({ services }: ServicesManagerProps) {
  const [serviceList, setServiceList] = useState<Service[]>(services);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      base_price: 10,
      features: "",
    },
  });

  const openAdd = () => {
    setEditing(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      base_price: 10,
      features: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    form.reset({
      name: service.name,
      slug: service.slug,
      description: service.description,
      base_price: service.base_price,
      features: (service.features || []).join("\n"),
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ServiceForm) => {
    setSaving(true);
    const featuresArray = data.features
      ? data.features
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f.length > 0)
      : [];

    if (editing) {
      // Update
      const { error } = await supabase
        .from("services")
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description,
          base_price: data.base_price,
          features: featuresArray,
        })
        .eq("id", editing.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message,
        });
      } else {
        toast({ variant: "success", title: "Service updated" });
        setDialogOpen(false);
        router.refresh();
      }
    } else {
      // Create
      const { error } = await supabase.from("services").insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        base_price: data.base_price,
        features: featuresArray,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Create failed",
          description: error.message,
        });
      } else {
        toast({ variant: "success", title: "Service created" });
        setDialogOpen(false);
        router.refresh();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    setDeleting(id);
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    } else {
      setServiceList((prev) => prev.filter((s) => s.id !== id));
      toast({ variant: "success", title: "Service deleted" });
      router.refresh();
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Service List */}
      <div className="grid gap-4">
        {serviceList.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{service.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(service.id)}
                  disabled={deleting === service.id}
                >
                  {deleting === service.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-mono text-xs text-muted-foreground">
                  /{service.slug}
                </span>
                <span className="font-bold text-primary">
                  {formatCurrency(service.base_price)}/page
                </span>
                <span className="text-muted-foreground line-clamp-1">
                  {service.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {serviceList.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No services yet. Add your first service.
          </p>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Essay Writing" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="essay-writing"
                {...form.register("slug")}
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe the service..."
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price (per page, USD)</Label>
              <Input
                id="base_price"
                type="number"
                min="1"
                {...form.register("base_price")}
              />
              {form.formState.errors.base_price && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.base_price.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">
                Features (one per line)
              </Label>
              <Textarea
                id="features"
                rows={4}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                {...form.register("features")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editing ? (
                  "Update Service"
                ) : (
                  "Create Service"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
