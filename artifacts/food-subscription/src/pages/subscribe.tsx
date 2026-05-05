import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListPlans, useCreateUser, useCreateOrder, useCreatePaymentOrder } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().min(10, "Please provide a complete address"),
  pincode: z.string().min(6, "Please provide a valid 6-digit pincode"),
  planId: z.coerce.number().positive("Please select a plan"),
});

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get plan from URL query if present
  const searchParams = new URLSearchParams(window.location.search);
  const initialPlanId = searchParams.get("plan");

  const { data: plans, isLoading: isLoadingPlans } = useListPlans();
  
  const createUser = useCreateUser();
  const createOrder = useCreateOrder();
  const createPaymentOrder = useCreatePaymentOrder();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      pincode: "",
      planId: initialPlanId ? parseInt(initialPlanId, 10) : 0,
    },
  });

  const selectedPlanId = form.watch("planId");
  const selectedPlan = plans?.find(p => p.id === selectedPlanId);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedPlan) {
      toast({ title: "Error", description: "Please select a valid plan.", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Create User
      const user = await createUser.mutateAsync({ data: {
        name: values.name,
        phone: values.phone,
        address: values.address,
        pincode: values.pincode,
      }});

      // 2. Create Order
      const order = await createOrder.mutateAsync({ data: {
        userId: user.id,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
      }});

      // 3. Create Payment Order (simulating Razorpay)
      const paymentOrder = await createPaymentOrder.mutateAsync({ data: {
        orderId: order.orderId,
        amount: order.amount,
        phone: user.phone,
      }});

      // Simulate payment success and redirect
      // In a real app, this would open the Razorpay checkout modal
      toast({ title: "Simulating payment...", description: "Redirecting to success page." });
      
      setTimeout(() => {
        setLocation(`/success?orderId=${order.orderId}`);
      }, 1000);
      
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Something went wrong", 
        description: "Could not process your subscription. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-serif mb-4">Complete your subscription</h1>
        <p className="text-xl text-muted-foreground">Just a few details so we know where to send your meals.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-12">
        <div>
          <div className="bg-card border rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-6">Delivery Details</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="9999999999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Flat No, Building, Street..." className="resize-none" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="110001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-bold font-serif mb-4">Select Plan</h3>
                  {isLoadingPlans ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="planId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          {plans?.map(plan => (
                            <div 
                              key={plan.id}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                field.value === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                              }`}
                              onClick={() => field.onChange(plan.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-bold font-serif text-lg">{plan.name}</div>
                                  <div className="text-sm text-muted-foreground">{plan.mealsPerDay} meals/day for {plan.durationDays} days</div>
                                </div>
                                <div className="font-mono font-bold text-lg text-primary">
                                  {formatCurrency(plan.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-lg h-14 rounded-xl mt-8" 
                  disabled={isSubmitting || !selectedPlanId}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Pay with Razorpay"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sticky top-24">
            <h2 className="font-serif font-bold text-xl mb-4">Order Summary</h2>
            
            {selectedPlan ? (
              <>
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-primary/10">
                  <div>
                    <div className="font-bold">{selectedPlan.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedPlan.durationDays} days subscription</div>
                  </div>
                  <div className="font-mono font-medium">{formatCurrency(selectedPlan.price)}</div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-muted-foreground">Delivery Fee</div>
                  <div className="text-sm text-accent font-medium">Free</div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-primary/20">
                  <div className="font-serif font-bold text-xl">Total</div>
                  <div className="font-mono font-bold text-2xl text-primary">{formatCurrency(selectedPlan.price)}</div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-sm py-8 text-center">
                Select a plan to see your order summary
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
