import { MessageCircle, Phone } from "lucide-react";
import { shop, whatsappLink } from "@/data/shop";

export default function WhatsAppButton() {
  return (
    <div className="fixed right-3 bottom-3 z-50 flex flex-col gap-2.5 sm:right-6 sm:bottom-6 sm:gap-3">
      <a
        href={shop.phoneLink}
        aria-label="Call the shop"
        className="hidden h-12 w-12 place-items-center rounded-full bg-brand-900 text-white shadow-lg sm:grid"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_-6px_rgba(37,211,102,0.6)]"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
