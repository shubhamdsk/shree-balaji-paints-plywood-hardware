import PaintCalculator from "@/components/calculator/PaintCalculator";
import PageHeader from "@/components/ui/PageHeader";
import { getCalculablePaints } from "@/services/catalog-service";

export default async function PaintCalculatorView({ productId = "" }: { productId?: string }) {
  const paints = await getCalculablePaints();
  const options = paints
    .map((p) => ({ id: p.id, label: `${p.brand} ${p.name}`, type: p.type, sizes: p.sizes }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="bg-surface">
      <PageHeader
        title="Paint calculator"
        width="narrow"
        description="Enter your room size to see how much paint you need and which packs to buy. Send the estimate to the shop on WhatsApp for a price."
      />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <PaintCalculator key={productId} products={options} initialProductId={productId} />
      </section>
    </div>
  );
}
