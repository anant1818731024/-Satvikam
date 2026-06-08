import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, CheckCircle2, Copy, ArrowRight } from "lucide-react";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await forgotPassword.mutateAsync({ data: { phone } });
      if (result.resetUrl) {
        setResetUrl(result.resetUrl);
      } else {
        toast({ title: "If this account exists, a reset link was generated." });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast({ title: "Error", description: msg || "Something went wrong.", variant: "destructive" });
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
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif">Reset link ready</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the button below to continue, or copy the link.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm break-all">
              <span className="flex-1 text-muted-foreground truncate">{window.location.origin}{resetUrl}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCopy}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
            {copied && <p className="text-xs text-green-600 text-center -mt-2">Copied!</p>}

            <Button className="w-full" onClick={() => navigate(resetUrl)}>
              Continue to reset password <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This link expires in 1 hour. In a production setup, this would be sent to your email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <SaffronLogo size="xl" className="justify-center mb-4" />
          <h1 className="text-3xl font-bold font-serif mb-2">Forgot password?</h1>
          <p className="text-muted-foreground">Enter your phone number to get a reset link.</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9999999999"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Generate reset link
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
