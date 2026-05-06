import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListProducts, useCreateOrder, useConfirmTestPayment } from "@workspace/api-client-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Utensils, ShoppingCart, Loader2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
};

export default function Menu() {
  const { data: products, isLoading, error } = useListProducts();
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const createOrder = useCreateOrder();
  const confirmPayment = useConfirmTestPayment();

  useEffect(() => {
    if (user) {
      setAddress(user.address);
      setPincode(user.pincode);
    }
  }, [user]);

  const handleCardClick = (product: Product) => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/menu");
      return;
    }
    setSelectedProduct(product);
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;
    try {
      setIsSubmitting(true);
      const order = await createOrder.mutateAsync({
        data: {
          userId: user.id,
          productId: selectedProduct.id,
          type: "single_item",
          amount: selectedProduct.price,
        },
      });
      await confirmPayment.mutateAsync({ data: { orderId: order.orderId } });
      setSelectedProduct(null);
      navigate(`/success?orderId=${order.orderId}`);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold font-serif mb-4">Our Menu</h1>
        <p className="text-xl text-muted-foreground">
          Wholesome vegetarian meals prepared fresh daily.
          {!authLoading && !isAuthenticated && (
            <span className="text-primary font-medium cursor-pointer" onClick={() => navigate("/login?redirect=/menu")}> Sign in to order.</span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="border rounded-2xl p-6 bg-card">
              <Skeleton className="h-6 w-2/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-6" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20">
          <p>Failed to load the menu. Please try again later.</p>
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border">
          <Utensils className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-serif mb-2">Check back soon</h2>
          <p className="text-muted-foreground">We're updating our menu right now.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map(product => (
            <div
              key={product.id}
              className="border rounded-2xl bg-card hover:shadow-md transition-all cursor-pointer group flex flex-col overflow-hidden"
              onClick={() => handleCardClick(product)}
            >
              {product.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold font-serif mb-2">{product.name}</h3>
                <p className="text-muted-foreground mb-4 flex-1 text-sm">{product.description || "A delicious, freshly prepared meal."}</p>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg font-bold text-primary">{formatCurrency(product.price)}</div>
                  <div className="flex items-center gap-1.5 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAuthenticated ? <ShoppingCart className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    {isAuthenticated ? "Order Now" : "Sign in"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Order {selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <form onSubmit={handleBuy} className="space-y-4 pt-2">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedProduct.name}</span>
                  <span className="font-mono font-bold text-primary">{formatCurrency(selectedProduct.price)}</span>
                </div>
                {selectedProduct.description && <p className="text-sm text-muted-foreground mt-1">{selectedProduct.description}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Delivery Address</label>
                <Textarea required rows={2} className="resize-none" value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat No, Building, Street..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Pincode</label>
                <Input required value={pincode} onChange={e => setPincode(e.target.value)} placeholder="110001" />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <ShoppingCart className="mr-2 w-4 h-4" />}
                {isSubmitting ? "Placing Order..." : `Pay ${formatCurrency(selectedProduct.price)}`}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
