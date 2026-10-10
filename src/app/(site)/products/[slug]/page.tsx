import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogView from "@/components/products/CatalogView";
import ProductDetailView from "@/components/products/ProductDetailView";
import { categoryPageMeta } from "@/lib/catalog";
import { getCategoryGroups, getProductById } from "@/services/catalog-service";

// Product pages render on their first visit instead of at build: every prerendered page costs a KV write per deploy.
export async function generateStaticParams() {
  return (await getCategoryGroups()).map((g) => ({ slug: g.id }));
}

async function findGroup(slug: string) {
  return (await getCategoryGroups()).find((g) => g.id === slug);
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const group = await findGroup(slug);
  if (group) return categoryPageMeta(group);
  const product = await getProductById(slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.description };
}

export default async function ProductOrCategoryPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const group = await findGroup(slug);
  if (group) return <CatalogView group={group} />;

  const product = await getProductById(slug);
  if (!product) notFound();
  return <ProductDetailView product={product} />;
}
