import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogView from "@/components/products/CatalogView";
import ProductDetailView from "@/components/products/ProductDetailView";
import { shop } from "@/config/shop";
import { getCategoryGroups, getProductById, getProducts } from "@/services/catalog-service";

export const dynamicParams = false;

export async function generateStaticParams() {
  const [products, groups] = await Promise.all([getProducts(), getCategoryGroups()]);
  return [...groups.map((g) => ({ slug: g.id })), ...products.map((p) => ({ slug: p.id }))];
}

async function findGroup(slug: string) {
  return (await getCategoryGroups()).find((g) => g.id === slug);
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const group = await findGroup(slug);
  if (group) {
    return { title: group.name, description: `Browse ${group.name.toLowerCase()} at ${shop.shortName}, ${shop.address.city}.` };
  }
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
