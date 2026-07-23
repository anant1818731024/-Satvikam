import { useEffect, useState } from "react";
import { useGetSettings, useUpdateAdminSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, MessageCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateAdminSettings();

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings?.whatsappNumber) {
      setWhatsappNumber(settings.whatsappNumber);
    }
  }, [settings?.whatsappNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    try {
      await updateSettings.mutateAsync({ data: { whatsappNumber } });
      setSaved(true);
      toast({ title: "WhatsApp number updated successfully" });
    } catch (err: any) {
      const msg = err?.data?.error || "Failed to update settings.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-serif">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage application-wide settings</p>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">WhatsApp number updated. It's now live across the site.</p>
        </div>
      )}

      <div className="bg-card border rounded-2xl p-6">
        <h2 className="font-serif font-bold text-lg mb-1 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          WhatsApp Contact Number
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Used for the "Chat on WhatsApp" button, the Support page, and order confirmation links.
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading current number...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">WhatsApp Number</label>
              <Input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="e.g. 919999999999"
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">
                Digits only, including country code, no spaces or symbols (10–15 digits).
              </p>
            </div>

            <Button
              type="submit"
              disabled={updateSettings.isPending || whatsappNumber.length < 10}
              className="w-full sm:w-auto"
            >
              {updateSettings.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
