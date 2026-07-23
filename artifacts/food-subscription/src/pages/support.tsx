import { MessageCircle, Phone, Mail, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSettings } from "@workspace/api-client-react";

const FALLBACK_WHATSAPP_NUMBER = "919999999999";

const faqs = [
  {
    q: "What time are meals delivered?",
    a: "We deliver between 11:30 AM and 1:30 PM every day. You'll receive a WhatsApp message when your meal is on the way.",
  },
  {
    q: "Can I change my delivery address?",
    a: "Yes! You can update your delivery address anytime from your Account > Profile page. Changes apply from the next delivery.",
  },
  {
    q: "What if I miss a delivery?",
    a: "If you're unavailable, our delivery partner will attempt delivery once more. Contact us on WhatsApp for rescheduling.",
  },
  {
    q: "How do I pause or cancel my subscription?",
    a: "Currently, pause and cancellation requests are handled manually. Please contact us on WhatsApp with your order ID and we'll sort it out quickly.",
  },
  {
    q: "Are the meals vegetarian?",
    a: "Yes — Saffron is 100% vegetarian. All our meals are freshly prepared without any meat, fish, or eggs.",
  },
  {
    q: "I paid but my order doesn't show up. What should I do?",
    a: "Please log into your account and check the Orders tab. If the issue persists, reach out on WhatsApp with your payment reference number.",
  },
  {
    q: "Do you deliver on weekends and holidays?",
    a: "Yes, we deliver every day including weekends and most public holidays. Check our WhatsApp status for any planned breaks.",
  },
  {
    q: "Can I order for someone else with their address?",
    a: "Yes — during checkout, you can enter any delivery address you like. It doesn't have to match your profile address.",
  },
];

export default function Support() {
  const { data: settings } = useGetSettings();
  const whatsappNumber = settings?.whatsappNumber || FALLBACK_WHATSAPP_NUMBER;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Saffron! I need help with my account.")}`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold font-serif mb-3">Help & Support</h1>
        <p className="text-xl text-muted-foreground">We're here to help. Reach us anytime.</p>
      </div>

      {/* Contact options */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 p-6 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl hover:bg-[#25D366]/15 transition-colors text-center"
        >
          <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <p className="font-semibold">WhatsApp</p>
            <p className="text-sm text-muted-foreground">Fastest response</p>
          </div>
          <span className="text-sm font-medium text-[#25D366]">Chat Now →</span>
        </a>

        <div className="flex flex-col items-center gap-3 p-6 bg-card border rounded-2xl text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Phone</p>
            <p className="text-sm text-muted-foreground">Mon–Sat, 9am–7pm</p>
          </div>
          <span className="text-sm font-medium text-primary">+91 99999 99999</span>
        </div>

        <div className="flex flex-col items-center gap-3 p-6 bg-card border rounded-2xl text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">Reply within 24h</p>
          </div>
          <span className="text-sm font-medium text-primary">hello@saffron.in</span>
        </div>
      </div>

      {/* Delivery hours notice */}
      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-10">
        <Clock className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm">
          <span className="font-semibold">Delivery hours:</span> 11:30 AM – 1:30 PM daily.
          WhatsApp support available 8 AM – 8 PM.
        </p>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold font-serif mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-card border rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium hover:bg-accent/30 transition-colors">
                {faq.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform ml-4 flex-shrink-0">▾</span>
              </summary>
              <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center bg-primary/5 border border-primary/20 rounded-2xl p-8">
        <h3 className="font-serif font-bold text-xl mb-2">Still have questions?</h3>
        <p className="text-muted-foreground mb-4">Our team typically replies within minutes on WhatsApp.</p>
        <Button asChild className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 w-4 h-4" />
            Message Us on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
