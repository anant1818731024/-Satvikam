import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminForgotPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, CheckCircle2, Copy, ArrowRight, Info } from "lucide-react";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

export default function AdminForgotPassword() {
  const [secret, setSecret] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const adminForgotPassword = useAdminForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await adminForgotPassword.mutateAsync({ data: { recoverySecret: secret } });
      setResetUrl(result.resetUrl);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast({ title: "Recovery failed", description: msg || "Invalid secret or recovery not configured.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (!resetUrl) return;
    const fullUrl = window.location.origin + resetUrl;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (resetUrl) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif">Reset link ready</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue below to set a new admin password. This link expires in 1 hour.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
              <span className="flex-1 text-muted-foreground truncate">{window.location.origin}{resetUrl}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCopy}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
            {copied && <p className="text-xs text-green-600 text-center -mt-2">Copied!</p>}

            <Button className="w-full" onClick={() => navigate(resetUrl)}>
              Continue to reset password <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <SaffronLogo size="xl" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold font-serif">Admin Recovery</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your recovery secret to reset the admin password</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Recovery Secret</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter ADMIN_RECOVERY_SECRET"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={adminForgotPassword.isPending}>
            {adminForgotPassword.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Generate reset link
          </Button>
        </form>

        <div className="flex items-start gap-2.5 bg-muted/60 border rounded-xl px-4 py-3 text-sm text-muted-foreground">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" />
          <span>
            The recovery secret is set via the{" "}
            <span className="font-medium text-foreground">ADMIN_RECOVERY_SECRET</span> environment variable.
          </span>
        </div>

        <div className="text-center">
          <Link href="/admin/login" className="text-sm text-primary hover:underline">
            Back to admin login
          </Link>
        </div>
      </div>
    </div>
  );
}
