import { Tag } from "@/components/ui/icons";
import { shop, whatsappLink } from "@/config/shop";

export default function OfferCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6 card-shadow sm:p-8">
        <Tag className="h-8 w-8 text-accent-600" />
        <h3 className="mt-4 text-xl font-extrabold text-brand-900">Contractor & bulk offers</h3>
        <p className="mt-2 text-sm text-stone-600">
          Special rates on paint drums, plywood sheets and hardware for painters and builders. Ask in store or
          on WhatsApp.
        </p>
      </div>
      <div className="rounded-3xl border border-stone-200 bg-surface p-6 card-shadow sm:p-8">
        <h3 className="text-xl font-extrabold text-brand-900">Free colour consultation</h3>
        <p className="mt-2 text-sm text-stone-600">
          Bring room photos or visit with your shade card — we help you pick interior and exterior combinations.
        </p>
        <a
          href={whatsappLink(`Hello ${shop.shortName}, I need colour consultation.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-bold text-accent-600"
        >
          Book via WhatsApp →
        </a>
      </div>
    </div>
  );
}
