import type { Metadata } from "next";
import CategoryDirectory from "@/components/products/CategoryDirectory";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";
import { getCategories, getCategoryGroups, getProducts } from "@/services/catalog-service";

export const metadata: Metadata = {
  title: "Categories",
  description: `Browse paints, plywood, hardware, plumbing, electrical, tools and adhesives at ${shop.shortName}, ${shop.address.city}.`,
};

export default async function CategoriesPage() {
  const [categories, groups, products] = await Promise.all([getCategories(), getCategoryGroups(), getProducts()]);

  return (
    <>
      <PageHeader
        title="Categories"
        description="Everything for building and finishing your home. Pick a category, or jump straight to a type."
      />
      <section className="container-page py-8 sm:py-12">
        <CategoryDirectory categories={categories} groups={groups} products={products} />
      </section>
    </>
  );
}
