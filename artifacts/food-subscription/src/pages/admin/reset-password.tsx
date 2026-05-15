import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminResetPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";

export default function AdminResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const adminResetPassword = useAdminResetPassword();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      toast({ title: "Invalid link", description: "No reset token found.", variant: "destructive" });
      navigate("/admin/forgot-password");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Admin password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    try {
      await adminResetPassword.mutateAsync({ data: { token, newPassword: password } });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast({ title: "Reset failed", description: msg || "The link may have expired.", variant: "destructive" });
    }
  };

  if (done) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Admin password updated!</h2>
              <p className="text-sm text-muted-foreground mt-1">You can now log in with your new password.</p>
            </div>
            <Button className="w-full mt-2" onClick={() => navigate("/admin/login")}>
              Go to Admin Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold font-serif text-2xl mx-auto mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold font-serif">Set new admin password</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose a strong password (at least 8 characters).</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={adminResetPassword.isPending || !token}>
              {adminResetPassword.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Update Admin Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
