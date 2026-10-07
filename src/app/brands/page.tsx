import type { Metadata } from "next";
import BrandGrid from "@/components/brands/BrandGrid";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";
import { countByBrand, getBrandNames } from "@/lib/catalog";
import { getProducts } from "@/services/catalog-service";

export const metadata: Metadata = {
  title: "Brands",
  description: `Genuine Asian Paints, Berger, Century Ply, Hettich and more at ${shop.shortName}, Kotul.`,
};

export default async function BrandsPage() {
  const products = await getProducts();

  return (
    <div className="bg-surface">
      <PageHeader
        title="Brands"
        description="Authorized and genuine products from names you trust. Pick a brand to see what we stock."
      />
      <section className="container-page py-8 sm:py-12">
        <BrandGrid brands={getBrandNames(products)} counts={countByBrand(products)} />
      </section>
    </div>
  );
}
