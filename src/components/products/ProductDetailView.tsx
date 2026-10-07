"use client";

import { useState } from "react";
import Image from "next/image";
import { Calculator, Check, ClipboardList, Phone, WhatsAppIcon } from "@/components/ui/icons";
import type { Product } from "@/types";
import { shop, whatsappLink } from "@/config/shop";
import BrandWordmark from "@/components/brand/BrandWordmark";
import AppLink from "@/components/ui/AppLink";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buttonClasses } from "@/components/ui/Button";
import { productLabel } from "@/lib/catalog";
import { productEnquiryMessage } from "@/lib/enquiry";
import { isCalculablePaint } from "@/lib/paint-calculator";
import { ROUTES } from "@/lib/routes";

const tabs = ["Description", "Technical Details", "Application", "Downloads"] as const;

export default function ProductDetailView({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Description");
  const [activeImage, setActiveImage] = useState(0);

  const thumbs =
    product.gallery?.length ? product.gallery : product.image ? [product.image] : [`/images/categories/${product.category}.jpg`];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: ROUTES.home },
          { label: "Products", href: ROUTES.products },
          { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), href: ROUTES.category(product.category) },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-surface-muted">
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
                    activeImage === i ? "border-accent-600" : "border-line"
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
          <h1 className="mt-4 text-[1.75rem] leading-tight font-bold text-heading sm:text-[2.25rem]">{product.name}</h1>
          <p className="mt-1 text-sm font-semibold text-muted">{product.type}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 text-[13px] font-semibold text-heading ring-1 ring-line">
            <span aria-hidden className={`h-2 w-2 rounded-full ${product.inStock ? "bg-success" : "bg-subtle"}`} />
            {product.inStock ? "Available in store" : "Out of stock — ask for availability"}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {product.longDescription ?? product.description}
          </p>

          <div className="mt-6">
            <p className="text-sm font-bold text-heading">Available Sizes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  aria-pressed={selectedSize === s}
                  className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    selectedSize === s
                      ? "border-accent-600 bg-accent-50 text-accent-600"
                      : "border-line bg-card text-ink hover:border-paint-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-heading">Key Features</p>
              <ul className="mt-2 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.suitableFor && product.suitableFor.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-heading">Suitable for</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.suitableFor.map((s) => (
                  <span key={s} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-ink">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-card border border-line bg-surface-muted p-4 sm:p-5">
            <p className="text-[15px] font-semibold text-heading">Get the latest price</p>
            <p className="mt-0.5 text-sm text-muted">
              Prices change with size, shade and quantity. Message us and we&apos;ll reply with today&apos;s rate.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <a
                href={whatsappLink(productEnquiryMessage(productLabel(product), selectedSize || undefined))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("whatsapp", "w-full", "lg")}
              >
                <WhatsAppIcon className="h-5 w-5" />
                Enquire for Price on WhatsApp
              </a>
              <a href={shop.phoneLink} className={buttonClasses("secondary", "w-full", "lg")}>
                <Phone className="h-5 w-5 text-accent-600" />
                Call Us
              </a>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            <AppLink
              href={ROUTES.enquiry(product.id)}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-heading hover:text-accent-600"
            >
              <ClipboardList className="h-4 w-4" /> Send a written enquiry
            </AppLink>
            {isCalculablePaint(product) && (
              <AppLink
                href={ROUTES.paintCalculator(product.id)}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-heading hover:text-accent-600"
              >
                <Calculator className="h-4 w-4" />
                How much do I need?
              </AppLink>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-line bg-card card-shadow">
        <div className="flex flex-wrap gap-1 border-b border-line p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === tab ? "bg-accent-50 text-accent-600" : "text-muted hover:bg-surface-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-5 text-sm leading-relaxed text-muted sm:p-6">
          {activeTab === "Description" && (
            <p>{product.longDescription ?? product.description}</p>
          )}
          {activeTab === "Technical Details" && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {product.technical ? (
                Object.entries(product.technical).map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-bold text-heading">{k}</dt>
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
                    <span className="font-semibold text-heading">{d.label}</span>
                    {d.note ? <span className="text-muted"> — {d.note}</span> : null}
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
