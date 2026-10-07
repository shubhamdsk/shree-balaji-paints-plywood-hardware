import type { Metadata } from "next";
import ContactDetails from "@/components/contact/ContactDetails";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call, WhatsApp or visit ${shop.shortName} in ${shop.address.city}. ${shop.hours}.`,
};

export default function ContactPage() {
  return (
    <div className="bg-card">
      <PageHeader title="Contact" description="Address, phone, WhatsApp, shop hours and directions." />
      <section className="container-page py-8 sm:py-12">
        <ContactDetails />
      </section>
    </div>
  );
}
