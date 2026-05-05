import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle } from "lucide-react";

export default function Success() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId");

  const whatsappMessage = encodeURIComponent(`Hi, I placed order ${orderId || 'recently'}. I'd like to know my delivery schedule.`);
  const whatsappUrl = `https://wa.me/919999999999?text=${whatsappMessage}`;

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 bg-background">
      <div className="max-w-md w-full bg-card border rounded-3xl p-8 text-center shadow-xl">
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold font-serif mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Welcome to the Saffron family. We've received your order and will start preparing your meals soon.
        </p>

        {orderId && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
            <p className="font-mono font-bold text-lg tracking-wider text-primary">{orderId}</p>
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
