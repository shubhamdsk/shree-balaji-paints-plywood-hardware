import type { Metadata } from "next";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { shop } from "@/config/shop";
import { getProducts } from "@/services/catalog-service";

export const metadata: Metadata = {
  title: "Send an enquiry",
  description: `Ask ${shop.shortName} for prices, stock and delivery of paints, plywood and hardware.`,
};

export default async function EnquiryPage({ searchParams }: PageProps<"/enquiry">) {
  const { product } = await searchParams;
  const products = await getProducts();
  const options = products
    .map((p) => ({ id: p.id, label: `${p.brand} ${p.name}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const initialProductId = typeof product === "string" && options.some((o) => o.id === product) ? product : "";

  return (
    <div className="bg-surface">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Enquiry" }]} />
          <h1 className="mt-4 text-3xl font-extrabold text-brand-900 sm:text-4xl">Send an enquiry</h1>
          <p className="mt-2 text-stone-600">
            Tell us what you need. Your enquiry opens in WhatsApp so you can send it straight to the shop.
          </p>
        </div>
      </div>
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <EnquiryForm key={initialProductId} products={options} initialProductId={initialProductId} />
      </section>
    </div>
  );
}
