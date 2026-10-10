import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PaintCalculatorView from "@/components/calculator/PaintCalculatorView";
import { getCalculablePaints } from "@/services/catalog-service";

// An empty list renders each page on its first visit (then caches it) instead of writing every one to KV per deploy.
export async function generateStaticParams() {
  return [];
}

async function findPaint(productId: string) {
  return (await getCalculablePaints()).find((p) => p.id === productId);
}

export async function generateMetadata({ params }: PageProps<"/paint-calculator/[productId]">): Promise<Metadata> {
  const paint = await findPaint((await params).productId);
  if (!paint) return { title: "Not found" };
  return {
    title: `Paint calculator: ${paint.name}`,
    description: `How many litres of ${paint.brand} ${paint.name} does your room need? Get the litres and pack sizes in seconds.`,
  };
}

export default async function ProductPaintCalculatorPage({ params }: PageProps<"/paint-calculator/[productId]">) {
  const { productId } = await params;
  if (!(await findPaint(productId))) notFound();
  return <PaintCalculatorView productId={productId} />;
}
