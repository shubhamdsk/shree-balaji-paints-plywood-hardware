import type { Metadata } from "next";
import OurStore from "@/components/about/OurStore";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";

export const metadata: Metadata = {
  title: "About",
  description: `${shop.name}: authorized Asian Paints dealer in Kotul, Maharashtra.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About"
        description={`${shop.shortName} is an authorized Asian Paints dealer in Kotul, serving homes, painters and builders.`}
      />
      <OurStore />
    </>
  );
}
