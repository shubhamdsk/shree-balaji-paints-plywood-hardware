import type { Metadata } from "next";
import CatalogView from "@/components/products/CatalogView";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse paints, plywood, hardware, plumbing, electrical and tools at Shree Balaji, Kotul.",
};

export default function ProductsPage() {
  return <CatalogView />;
}
