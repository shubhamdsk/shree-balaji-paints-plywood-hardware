import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogView from "@/components/products/CatalogView";
import { shop } from "@/config/shop";
import { findSubtypeBySlug, listStockedSubtypes } from "@/lib/catalog";
import { slugify } from "@/lib/slug";
import { getCategoryGroups, getProducts } from "@/services/catalog-service";

export const dynamicParams = false;

export async function generateStaticParams() {
  const [products, groups] = await Promise.all([getProducts(), getCategoryGroups()]);
  return listStockedSubtypes(products, groups).map(({ group, subtype }) => ({ slug: group.id, type: slugify(subtype) }));
}

async function resolve(slug: string, type: string) {
  const group = (await getCategoryGroups()).find((g) => g.id === slug);
  const subtype = group && findSubtypeBySlug(group, type);
  return group && subtype ? { group, subtype } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]/[type]">): Promise<Metadata> {
  const { slug, type } = await params;
  const match = await resolve(slug, type);
  if (!match) return { title: "Not found" };
  const name = `${match.subtype} ${match.group.name}`;
  return { title: name, description: `Browse ${name.toLowerCase()} at ${shop.shortName}, ${shop.address.city}.` };
}

export default async function CategoryTypePage({ params }: PageProps<"/products/[slug]/[type]">) {
  const { slug, type } = await params;
  const match = await resolve(slug, type);
  if (!match) notFound();
  return <CatalogView group={match.group} subtype={match.subtype} />;
}
