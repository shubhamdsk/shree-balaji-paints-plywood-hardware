import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCatalog from "@/components/ProductCatalog";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse paints, plywood, hardware, plumbing, electrical and tools at Shree Balaji, Kotul.",
};

export default function ProductsPage() {
  return (
    <div className="bg-surface">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
          <h1 className="mt-4 text-3xl font-extrabold text-brand-900 sm:text-4xl">Products</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Genuine brands, fair local pricing. Filter by category or message us on WhatsApp for rates and
            availability.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-stone-200" />}>
          <ProductCatalog />
        </Suspense>
      </section>
    </div>
  );
}
