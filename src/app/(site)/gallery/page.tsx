import type { Metadata } from "next";
import GalleryView from "@/components/gallery/GalleryView";
import { getPublicGalleryItems } from "@/services/gallery-service";

export const metadata: Metadata = {
  title: "Our Work Gallery | Shree Balaji Paints, Plywood & Hardware",
  description:
    "Explore photos of finished painting, plywood, furniture, and hardware projects delivered across Kotul.",
};

export default async function GalleryPage() {
  const items = await getPublicGalleryItems();
  return <GalleryView items={items} />;
}
