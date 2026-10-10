import type { Metadata } from "next";
import { Baloo_2, Noto_Sans_Devanagari } from "next/font/google";
import "@/app/globals.css";
import LocalBusinessJsonLd from "@/components/layout/LocalBusinessJsonLd";
import ThemeScript from "@/components/layout/ThemeScript";
import { shop } from "@/config/shop";
import { siteUrl } from "@/config/site";
import AppProviders from "@/providers/AppProviders";

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["devanagari", "latin"],
  weight: ["600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${shop.name} | Paints, Plywood & Hardware in Kotul`,
    template: `%s | ${shop.shortName}`,
  },
  description:
    "Authorized Asian Paints dealer in Kotul, Maharashtra. Interior & exterior paints, plywood, laminates and complete hardware under one roof.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${notoDevanagari.variable} ${baloo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <LocalBusinessJsonLd />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
