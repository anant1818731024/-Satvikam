import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUserSignup, getGetUserMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const signup = useUserSignup();

  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "", address: "", pincode: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password too short", description: "At least 6 characters required.", variant: "destructive" });
      return;
    }
    try {
      await signup.mutateAsync({
        data: {
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          password: form.password,
          address: form.address,
          pincode: form.pincode,
        },
      });
      queryClient.setQueryData(getGetUserMeQueryKey(), { authenticated: true });
      navigate("/account");
    } catch (err: any) {
      const msg = err?.data?.error || "Could not create account. Please try again.";
      toast({ title: "Signup failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <SaffronLogo size="xl" className="justify-center mb-4" />
          <h1 className="text-3xl font-bold font-serif mb-2">Create your account</h1>
          <p className="text-muted-foreground">Join Saffron and start getting wholesome meals</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <Input required placeholder="John Doe" value={form.name} onChange={set("name")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone Number</label>
                <Input required type="tel" placeholder="9999999999" value={form.phone} onChange={set("phone")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Email <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <Input required type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input required type="password" placeholder="Same as above" value={form.confirmPassword} onChange={set("confirmPassword")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Delivery Address</label>
              <Textarea required rows={2} placeholder="Flat No, Building, Street, City" className="resize-none" value={form.address} onChange={set("address")} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pincode</label>
              <Input required placeholder="110001" value={form.pincode} onChange={set("pincode")} />
            </div>

            <Button type="submit" className="w-full h-11 mt-2" disabled={signup.isPending}>
              {signup.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
