import type { Metadata } from "next";
import { Baloo_2, Poppins } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { shop } from "@/config/shop";
import { siteUrl } from "@/config/site";
import AppProviders from "@/providers/AppProviders";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["devanagari", "latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${shop.name} | Asian Paints Dealer in Kotul`,
    template: `%s | ${shop.shortName}`,
  },
  description:
    "Authorized Asian Paints dealer in Kotul, Maharashtra. Interior & exterior paints, plywood, laminates and complete hardware under one roof.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${baloo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-clip font-sans">
        <AppProviders>
          <Navbar />
          <main className="flex-1 pb-24 sm:pb-0">{children}</main>
          <Footer />
          <WhatsAppButton />
        </AppProviders>
      </body>
    </html>
  );
}
