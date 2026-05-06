import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUserLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Lock } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const login = useUserLogin();

  const searchParams = new URLSearchParams(window.location.search);
  const redirect = searchParams.get("redirect") || "/account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ data: { phone, password } });
      queryClient.invalidateQueries();
      navigate(redirect);
    } catch {
      toast({ title: "Login failed", description: "Wrong phone number or password.", variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your Saffron account</p>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={login.isPending}>
              {login.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
