"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSiteSettings } from "./actions";
import type { SiteSettings } from "@/lib/settings";

export function SettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const [email, setEmail] = useState(initialSettings.contact_email);
  const [phone, setPhone] = useState(initialSettings.contact_phone);
  const [whatsapp, setWhatsapp] = useState(initialSettings.whatsapp_number);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSiteSettings({
      contact_email: email.trim(),
      contact_phone: phone.trim(),
      whatsapp_number: whatsapp.trim(),
    });
    setSaving(false);

    if (!result.success) {
      toast({ variant: "destructive", title: "Couldn't save", description: result.error });
    } else {
      toast({
        variant: "success",
        title: "Settings saved",
        description: "Changes will appear across the site within a minute.",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone (displayed)</Label>
          <Input
            id="contact_phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (209) 560-0466"
          />
          <p className="text-xs text-muted-foreground">
            How the number is shown on the site, formatting included.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="12095600466"
          />
          <p className="text-xs text-muted-foreground">
            Digits only, country code first, no + or spaces — used to build the
            WhatsApp chat link.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
