import { MessageCircle } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";

const FALLBACK_WHATSAPP_NUMBER = "919999999999";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi Saffron! I have a question about my order.");

export function WhatsAppButton() {
  const { data: settings } = useGetSettings();
  const whatsappNumber = settings?.whatsappNumber || FALLBACK_WHATSAPP_NUMBER;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
}
