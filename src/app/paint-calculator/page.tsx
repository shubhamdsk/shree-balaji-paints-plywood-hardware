import type { Metadata } from "next";
import PaintCalculatorView from "@/components/calculator/PaintCalculatorView";
import { shop } from "@/config/shop";

export const metadata: Metadata = {
  title: "Paint calculator",
  description: `Work out how many litres of paint your room needs and which packs to buy, then ask ${shop.shortName} for a price.`,
};

export default function PaintCalculatorPage() {
  return <PaintCalculatorView />;
}
