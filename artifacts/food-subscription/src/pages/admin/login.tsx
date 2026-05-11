import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Shield, KeyRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const login = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login.mutateAsync({ data: { password } });
      if (result.authenticated) {
        queryClient.invalidateQueries();
        navigate("/admin");
      }
    } catch {
      toast({ title: "Wrong password", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold font-serif text-2xl mx-auto mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold font-serif">Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter the admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="pl-9"
                autoFocus
                autoComplete="current-password"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Login
          </Button>
        </form>

        {/* Security info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2.5 bg-muted/60 border rounded-xl px-4 py-3 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/70" />
            <span>
              To change your password, log in and go to{" "}
              <span className="font-medium text-foreground">Admin → Security</span>.
            </span>
          </div>
          <details className="group">
            <summary className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors list-none">
              <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />
              Locked out?
              <span className="ml-auto group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 space-y-1.5 mt-1">
              <p className="font-semibold">Emergency password reset</p>
              <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                <li>Set the <code className="bg-amber-100 px-1 rounded font-mono">ADMIN_PASSWORD</code> environment secret to your desired new password</li>
                <li>Connect to the database and run:<br />
                  <code className="bg-amber-100 px-1 rounded font-mono block mt-1">DELETE FROM admin_config;</code>
                </li>
                <li>Restart the API server — it will re-seed from the env var</li>
                <li>Log in with the new password, then remove the env var</li>
              </ol>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
