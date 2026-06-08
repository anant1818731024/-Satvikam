import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

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
        // Set cache synchronously before navigating so AdminLayout
        // sees authenticated=true immediately — avoids the race where
        // stale unauthenticated data bounces the user back to /login.
        queryClient.setQueryData(getGetAdminMeQueryKey(), { authenticated: true });
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
          <SaffronLogo size="xl" className="justify-center mb-4" />
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

        <div className="mt-3 text-center">
          <a href="/admin/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Security hint */}
        <div className="mt-3 flex items-start gap-2.5 bg-muted/60 border rounded-xl px-4 py-3 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/70" />
          <span>
            To change your password, log in and go to{" "}
            <span className="font-medium text-foreground">Admin → Security</span>.
          </span>
        </div>
      </div>
    </div>
  );
}
