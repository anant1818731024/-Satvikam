import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useListPlans, useCreateOrder, useConfirmTestPayment } from "@workspace/api-client-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Subscribe() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const initialPlanId = searchParams.get("plan") ? parseInt(searchParams.get("plan")!, 10) : 0;

  const { data: plans, isLoading: isLoadingPlans } = useListPlans();
  const createOrder = useCreateOrder();
  const confirmPayment = useConfirmTestPayment();

  const [selectedPlanId, setSelectedPlanId] = useState<number>(initialPlanId);
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/subscribe");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setAddress(user.address);
      setPincode(user.pincode);
    }
  }, [user]);

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;
    try {
      setIsSubmitting(true);
      const order = await createOrder.mutateAsync({
        data: {
          userId: user.id,
          planId: selectedPlan.id,
          type: "subscription",
          amount: selectedPlan.price,
        },
      });
      await confirmPayment.mutateAsync({ data: { orderId: order.orderId } });
      toast({ title: "Payment successful!", description: "Your subscription is now active." });
      setTimeout(() => navigate(`/success?orderId=${order.orderId}`), 600);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-12" />
        <div className="grid md:grid-cols-[1fr_350px] gap-12">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-serif mb-3">Choose your plan</h1>
        <p className="text-xl text-muted-foreground">Delivering to {user?.address?.split(",")[0]}.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Plan selection */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-serif font-bold text-xl mb-4">Select Plan</h2>
            {isLoadingPlans ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3">
                {plans?.map(plan => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPlanId === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold font-serif text-lg">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">{plan.mealsPerDay} meal/day · {plan.durationDays} days</div>
                      </div>
                      <div className="font-mono font-bold text-lg text-primary">{formatCurrency(plan.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery address */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-serif font-bold text-xl mb-4">Delivery Address</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  required
                  rows={2}
                  className="resize-none"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Flat No, Building, Street..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Pincode</label>
                <Input required value={pincode} onChange={e => setPincode(e.target.value)} placeholder="110001" />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl" disabled={isSubmitting || !selectedPlanId}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? "Processing..." : selectedPlan ? `Pay ${formatCurrency(selectedPlan.price)}` : "Select a Plan"}
          </Button>
        </form>

        {/* Order summary */}
        <div>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sticky top-24">
            <h2 className="font-serif font-bold text-xl mb-4">Order Summary</h2>
            {selectedPlan ? (
              <>
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-primary/10">
                  <div>
                    <div className="font-bold">{selectedPlan.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedPlan.durationDays} days</div>
                  </div>
                  <div className="font-mono font-medium">{formatCurrency(selectedPlan.price)}</div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>Delivery</span><span className="text-accent font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                  <div className="font-serif font-bold text-xl">Total</div>
                  <div className="font-mono font-bold text-2xl text-primary">{formatCurrency(selectedPlan.price)}</div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-sm py-6 text-center">Select a plan to continue</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
