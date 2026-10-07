import { MessageCircle, Phone } from "@/components/ui/icons";
import { shop, whatsappLink } from "@/config/shop";

export default function WhatsAppButton() {
  return (
    <div className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-3 lg:right-6 lg:bottom-6">
      <a
        href={shop.phoneLink}
        aria-label="Call the shop"
        className="hidden h-12 w-12 place-items-center rounded-full bg-brand-900 text-white shadow-card-hover transition hover:bg-brand-700 lg:grid"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-whatsapp-strong text-white shadow-card-hover transition hover:scale-105 hover:brightness-110"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
