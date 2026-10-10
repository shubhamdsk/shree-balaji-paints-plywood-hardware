import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";
import { ROUTES } from "@/lib/routes";
import { findBrand, getBrandProducts } from "@/services/catalog-service";

// An empty list renders each page on its first visit (then caches it) instead of writing every one to KV per deploy.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = await findBrand(slug);
  if (!brand) return { title: "Brand not found" };
  return { title: brand, description: `Genuine ${brand} products at ${shop.shortName}, ${shop.address.city}.` };
}

export default async function BrandPage({ params }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const brand = await findBrand(slug);
  if (!brand) notFound();
  const brandProducts = await getBrandProducts(brand);

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
