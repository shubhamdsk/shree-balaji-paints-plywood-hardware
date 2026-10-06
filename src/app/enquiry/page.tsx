import type { Metadata } from "next";
import EnquiryView from "@/components/enquiry/EnquiryView";
import { shop } from "@/config/shop";

export const metadata: Metadata = {
  title: "Send an enquiry",
  description: `Ask ${shop.shortName} for prices, stock and delivery of paints, plywood and hardware.`,
};

export default function EnquiryPage() {
  return <EnquiryView />;
}
