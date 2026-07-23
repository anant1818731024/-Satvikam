import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, Package, Truck, Clock } from "lucide-react";
import { useGetOrderByOrderId, useGetSettings } from "@workspace/api-client-react";

const FALLBACK_WHATSAPP_NUMBER = "919999999999";

export default function Success() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId") || "";

  const { data: order } = useGetOrderByOrderId(orderId, { query: { enabled: !!orderId } as any });
  const { data: settings } = useGetSettings();

  const whatsappNumber = settings?.whatsappNumber || FALLBACK_WHATSAPP_NUMBER;
  const whatsappMessage = encodeURIComponent(`Hi, I placed order ${orderId || "recently"}. I'd like to know my delivery schedule.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const deliveryIcon = order?.deliveryStatus === "delivered" ? Truck : Clock;
  const DeliveryIcon = deliveryIcon;

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 bg-background">
      <div className="max-w-md w-full bg-card border rounded-3xl p-8 text-center shadow-xl">
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold font-serif mb-4">
          {order?.type === "single_item" ? "Order Placed!" : "Subscription Active!"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {order?.type === "single_item"
            ? "We've received your order and will deliver it to you soon."
            : "Welcome to the Saffron family. Your meals will start arriving on schedule."}
        </p>

        {orderId && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
            <p className="font-mono font-bold text-lg tracking-wider text-primary">{orderId}</p>
          </div>
        )}

        {order && (
          <div className={`rounded-xl p-4 mb-8 flex items-center gap-3 ${
            order.deliveryStatus === "delivered"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}>
            <DeliveryIcon className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium">
                {order.deliveryStatus === "delivered" ? "Delivered" : "Pending Delivery"}
              </p>
              <p className="text-xs opacity-70">
                {order.deliveryStatus === "delivered"
                  ? "Your order has been delivered"
                  : "We will deliver your order soon"}
              </p>
            </div>
          </div>
        )}

        {order?.type === "subscription" && (
          <div className="bg-card border rounded-xl p-4 mb-8 flex items-center gap-3">
            <Package className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium">{order.planName}</p>
              <p className="text-xs text-muted-foreground">Active subscription</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button asChild className="w-full h-12 text-base rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 w-5 h-5" />
              Chat on WhatsApp
            </a>
          </Button>

          <Button asChild variant="outline" className="w-full h-12 text-base rounded-xl">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
