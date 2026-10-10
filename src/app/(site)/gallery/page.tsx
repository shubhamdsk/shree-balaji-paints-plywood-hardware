import type { Metadata } from "next";
import GalleryView from "@/components/gallery/GalleryView";
import { shop } from "@/config/shop";
import { getPublicGalleryItems } from "@/services/gallery-service";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photos of painting, plywood and hardware work done by ${shop.shortName} around ${shop.address.city}.`,
};

export default async function GalleryPage() {
  const items = await getPublicGalleryItems();
  return <GalleryView items={items} />;
}
