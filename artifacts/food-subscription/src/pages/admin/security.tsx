import { useState } from "react";
import { useAdminChangePassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminSecurity() {
  const { toast } = useToast();
  const changePassword = useAdminChangePassword();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changed, setChanged] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-destructive", width: "w-1/5" };
    if (score <= 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/5" };
    if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "w-3/5" };
    if (score <= 4) return { label: "Strong", color: "bg-green-500", width: "w-4/5" };
    return { label: "Very Strong", color: "bg-green-600", width: "w-full" };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.newPassword.length < 8) {
      toast({ title: "New password must be at least 8 characters", variant: "destructive" });
      return;
    }
    try {
      await changePassword.mutateAsync({
        data: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setChanged(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated successfully" });
    } catch (err: any) {
      const msg = err?.data?.error || "Failed to change password.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-serif">Security</h1>
          <p className="text-muted-foreground text-sm">Manage your admin password</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex gap-3">
        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Password stored securely</p>
          <p>Your admin password is hashed using bcrypt and stored in the database — not in any environment variable or config file.</p>
        </div>
      </div>

      {changed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">Password changed successfully. Use your new password on your next login.</p>
        </div>
      )}

      <div className="bg-card border rounded-2xl p-6">
        <h2 className="font-serif font-bold text-lg mb-6">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                required
                value={form.currentPassword}
                onChange={set("currentPassword")}
                placeholder="Enter current password"
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                required
                value={form.newPassword}
                onChange={set("newPassword")}
                placeholder="At least 8 characters"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength meter */}
            {strength && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                </div>
                <p className={`text-xs font-medium ${
                  strength.label === "Weak" ? "text-destructive" :
                  strength.label === "Fair" ? "text-amber-600" :
                  strength.label === "Good" ? "text-yellow-600" : "text-green-600"
                }`}>{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              required
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Repeat new password"
              autoComplete="new-password"
              className={
                form.confirmPassword && form.confirmPassword !== form.newPassword
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {form.confirmPassword && form.confirmPassword !== form.newPassword && (
              <p className="text-xs text-destructive">Passwords don't match</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={changePassword.isPending || (!!form.confirmPassword && form.confirmPassword !== form.newPassword)}
            className="w-full sm:w-auto"
          >
            {changePassword.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-muted/50 rounded-xl p-4">
        <p className="text-sm font-medium mb-2">Password tips</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use at least 12 characters for a strong password</li>
          <li>• Mix uppercase, lowercase, numbers, and symbols</li>
          <li>• Avoid reusing passwords from other accounts</li>
          <li>• Never share your admin password with anyone</li>
        </ul>
      </div>
    </div>
  );
}
