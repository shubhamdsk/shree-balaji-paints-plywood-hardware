import EnquiryForm from "@/components/enquiry/EnquiryForm";
import PageHeader from "@/components/ui/PageHeader";
import { getProductIndex } from "@/services/catalog-service";

export default async function EnquiryView({ productId = "" }: { productId?: string }) {
  const products = await getProductIndex();
  const options = products
    .map((p) => ({ id: p.id, label: `${p.brand} ${p.name}` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="bg-surface">
      <PageHeader
        title="Enquiry"
        width="narrow"
        description="Tell us what you need and send it straight to the shop."
      />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <EnquiryForm key={productId} products={options} initialProductId={productId} />
      </section>
    </div>
  );
}
