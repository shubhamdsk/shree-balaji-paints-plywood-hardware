import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";
import { findBrandBySlug, getBrandNames } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import { slugify } from "@/lib/slug";
import { getProducts } from "@/services/catalog-service";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getBrandNames(await getProducts()).map((name) => ({ slug: slugify(name) }));
}

export async function generateMetadata({ params }: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = findBrandBySlug(await getProducts(), slug);
  if (!brand) return { title: "Brand not found" };
  return { title: brand, description: `Genuine ${brand} products at ${shop.shortName}, ${shop.address.city}.` };
}

export default async function BrandPage({ params }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const products = await getProducts();
  const brand = findBrandBySlug(products, slug);
  if (!brand) notFound();
  const brandProducts = products.filter((p) => p.brand === brand);

  return (
    <div className="bg-surface">
      <PageHeader
        title={brand}
        parents={[{ label: "Brands", href: ROUTES.brands }]}
        description={`${brandProducts.length} genuine ${brand} ${brandProducts.length === 1 ? "product" : "products"} available at ${shop.shortName}. Ask on WhatsApp for rates.`}
      />
      <section className="container-page py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brandProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
