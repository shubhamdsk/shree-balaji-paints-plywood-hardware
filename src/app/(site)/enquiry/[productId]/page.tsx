import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EnquiryView from "@/components/enquiry/EnquiryView";
import { shop } from "@/config/shop";
import { getProductById, getProducts } from "@/services/catalog-service";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ productId: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/enquiry/[productId]">): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) return { title: "Not found" };
  return {
    title: `Enquiry: ${product.name}`,
    description: `Ask ${shop.shortName} for the price and stock of ${product.brand} ${product.name}.`,
  };
}

export default async function ProductEnquiryPage({ params }: PageProps<"/enquiry/[productId]">) {
  const { productId } = await params;
  if (!(await getProductById(productId))) notFound();
  return <EnquiryView productId={productId} />;
}
