import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetMyOrders, useGetMySubscriptions, useUpdateUserMe, getUserMeQueryKey } from "@workspace/api-client-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/format";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, CalendarClock, User, Package, CheckCircle2, Clock, Loader2 } from "lucide-react";

export default function Account() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/account");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { data: orders, isLoading: ordersLoading } = useGetMyOrders({ query: { enabled: isAuthenticated } as any });
  const { data: subscriptions, isLoading: subsLoading } = useGetMySubscriptions({ query: { enabled: isAuthenticated } as any });

  const updateProfile = useUpdateUserMe();
  const [profileForm, setProfileForm] = useState({ name: "", email: "", address: "", pincode: "" });
  const [profileInitialized, setProfileInitialized] = useState(false);

  useEffect(() => {
    if (user && !profileInitialized) {
      setProfileForm({ name: user.name, email: user.email || "", address: user.address, pincode: user.pincode });
      setProfileInitialized(true);
    }
  }, [user, profileInitialized]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ data: profileForm });
      queryClient.invalidateQueries({ queryKey: getUserMeQueryKey() });
      toast({ title: "Profile updated" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif">My Account</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name?.split(" ")[0]}!</p>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-8">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4" /> Subscriptions
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="space-y-4">
            {ordersLoading ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
            ) : orders?.length === 0 ? (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <ShoppingBag className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
                <h3 className="font-serif text-xl mb-1">No orders yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Browse the menu or subscribe to get started</p>
                <Button asChild variant="outline"><a href="/menu">Browse Menu</a></Button>
              </div>
            ) : (
              orders?.map(order => (
                <div key={order.id} className="bg-card border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-muted-foreground">{order.orderId}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {order.type === "single_item" ? "Single Item" : "Subscription"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">
                      {order.type === "single_item" ? order.productName : order.planName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {format(new Date(order.createdAt), "MMM d, yyyy")} · {formatCurrency(order.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={order.status === "paid" ? "default" : "secondary"}
                      className={order.status === "paid" ? "bg-accent text-accent-foreground" : ""}>
                      {order.status}
                    </Badge>
                    <div className={`flex items-center gap-1.5 text-sm font-medium rounded-full px-3 py-1 ${
                      order.deliveryStatus === "delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {order.deliveryStatus === "delivered"
                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                        : <Clock className="w-3.5 h-3.5" />}
                      {order.deliveryStatus === "delivered" ? "Delivered" : "Pending"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <div className="space-y-4">
            {subsLoading ? (
              [1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
            ) : subscriptions?.length === 0 ? (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <CalendarClock className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
                <h3 className="font-serif text-xl mb-1">No subscriptions yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Choose a plan and get daily meals delivered</p>
                <Button asChild><a href="/subscription">View Plans</a></Button>
              </div>
            ) : (
              subscriptions?.map(sub => {
                const daysLeft = differenceInDays(new Date(sub.endDate), new Date());
                return (
                  <div key={sub.id} className="bg-card border rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-primary" />
                          <h3 className="font-bold font-serif text-lg">{sub.planName}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{sub.orderId}</p>
                      </div>
                      <Badge className={sub.status === "active" ? "bg-accent text-accent-foreground" : ""} variant={sub.status === "active" ? "default" : "secondary"}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Started</p>
                        <p className="font-medium">{format(new Date(sub.startDate), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Ends</p>
                        <p className="font-medium">{format(new Date(sub.endDate), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Remaining</p>
                        <p className={`font-bold ${daysLeft <= 3 && sub.status === "active" ? "text-amber-600" : ""}`}>
                          {sub.status === "active" ? `${Math.max(0, daysLeft)} days` : "Ended"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-card border rounded-2xl p-6 max-w-lg">
            <h2 className="font-serif font-bold text-xl mb-6">Edit Profile</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input value={user?.phone || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Input type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Delivery Address</label>
                <Textarea rows={2} className="resize-none" value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Pincode</label>
                <Input value={profileForm.pincode} onChange={e => setProfileForm(p => ({ ...p, pincode: e.target.value }))} required />
              </div>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
