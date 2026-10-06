"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, MessageCircle } from "@/components/ui/icons";
import type { Product } from "@/types";
import { shop, whatsappLink } from "@/config/shop";
import BrandWordmark from "@/components/brand/BrandWordmark";
import AppLink from "@/components/ui/AppLink";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buttonClasses } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";

const tabs = ["Description", "Technical Details", "Application", "Downloads"] as const;

export default function ProductDetailView({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Description");
  const [activeImage, setActiveImage] = useState(0);

  const thumbs =
    product.gallery?.length ? product.gallery : product.image ? [product.image] : [`/images/categories/${product.category}.jpg`];

  const waMessage = `Hello ${shop.shortName}, I want to enquire about ${product.brand} ${product.name}${
    selectedSize ? ` (size: ${selectedSize})` : ""
  }.`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), href: ROUTES.category(product.category) },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-stone-200 bg-stone-50">
            <Image
              src={thumbs[activeImage]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {thumbs.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {thumbs.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                    activeImage === i ? "border-accent-500" : "border-stone-200"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <BrandWordmark name={product.brand} />
          <h1 className="mt-4 text-2xl font-extrabold text-brand-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm font-semibold text-stone-500">{product.type}</p>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            {product.longDescription ?? product.description}
          </p>

          <div className="mt-6">
            <p className="text-sm font-bold text-brand-900">Available Sizes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedSize === s
                      ? "border-accent-500 bg-orange-50 text-accent-600"
                      : "border-stone-200 bg-white text-stone-700 hover:border-orange-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-brand-900">Key Features</p>
              <ul className="mt-2 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.suitableFor && product.suitableFor.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-brand-900">Suitable for</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.suitableFor.map((s) => (
                  <span key={s} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-bold text-white shadow-[0_10px_28px_-8px_rgba(37,211,102,0.55)] sm:flex-none"
            >
              <MessageCircle className="h-5 w-5" />
              Enquire on WhatsApp
            </a>
            <AppLink
              href={ROUTES.enquiry(product.id)}
              className={buttonClasses("secondary")}
            >
              Get a Quote
            </AppLink>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-stone-200 bg-white card-shadow">
        <div className="flex flex-wrap gap-1 border-b border-stone-100 p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === tab ? "bg-orange-50 text-accent-600" : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-5 text-sm leading-relaxed text-stone-600 sm:p-6">
          {activeTab === "Description" && (
            <p>{product.longDescription ?? product.description}</p>
          )}
          {activeTab === "Technical Details" && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {product.technical ? (
                Object.entries(product.technical).map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-bold text-brand-900">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))
              ) : (
                <p>Technical datasheet available on request at the shop or via WhatsApp.</p>
              )}
            </dl>
          )}
          {activeTab === "Application" && (
            <p>{product.application ?? "Ask our team for surface preparation and application tips for your site."}</p>
          )}
          {activeTab === "Downloads" && (
            <ul className="space-y-2">
              {(product.downloads ?? [{ label: "Shade card / datasheet", note: "Message us on WhatsApp" }]).map(
                (d) => (
                  <li key={d.label}>
                    <span className="font-semibold text-brand-900">{d.label}</span>
                    {d.note ? <span className="text-stone-500"> — {d.note}</span> : null}
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
