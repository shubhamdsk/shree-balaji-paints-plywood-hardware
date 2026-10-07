import Image from "next/image";
import { ArrowRight, WhatsAppIcon } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { whatsappLink } from "@/config/shop";
import { productLabel } from "@/lib/catalog";
import { productEnquiryMessage } from "@/lib/enquiry";
import { ROUTES } from "@/lib/routes";
import type { Product } from "@/types";

function productImage(product: Product) {
  return product.gallery?.[0] ?? product.image ?? `/images/categories/${product.category}.jpg`;
}

function categoryName(product: Product) {
  return product.category.charAt(0).toUpperCase() + product.category.slice(1);
}

const MAX_SIZES = 4;

export default function ProductCard({ product }: { product: Product }) {
  const href = ROUTES.product(product.id);
  const extraSizes = product.sizes.length - MAX_SIZES;

  return (
    <article className="group card-lift flex h-full flex-col overflow-hidden rounded-card border border-line bg-card hover:border-brand-200">
      <AppLink href={href} tabIndex={-1} aria-hidden className="relative block aspect-[4/3] overflow-hidden bg-surface-muted">
        <Image
          src={productImage(product)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
          className="img-zoom object-cover"
        />
        {!product.inStock && (
          <span className="absolute top-3 left-3 rounded-md bg-brand-900 px-2 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </AppLink>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[13px] font-bold tracking-wide text-accent-600 uppercase">{product.brand}</p>
        <h3 className="mt-1 text-lg leading-snug font-semibold text-heading">
          <AppLink href={href} className="hover:text-accent-600 focus-visible:underline">
            {product.name}
          </AppLink>
        </h3>
        <p className="mt-0.5 text-sm text-muted">
          {categoryName(product)} · {product.type}
        </p>

        {product.sizes.length > 0 && (
          <div className="mt-3">
            <p className="sr-only">Available sizes</p>
            <ul className="flex flex-wrap gap-1.5">
              {product.sizes.slice(0, MAX_SIZES).map((s) => (
                <li
                  key={s}
                  className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[13px] font-medium text-ink"
                >
                  {s}
                </li>
              ))}
              {extraSizes > 0 && <li className="px-1 py-0.5 text-[13px] text-muted">+{extraSizes} more</li>}
            </ul>
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-5">
          <a
            href={whatsappLink(productEnquiryMessage(productLabel(product)))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
            className={buttonClasses("whatsapp", "flex-1 px-3 text-[15px]")}
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" /> Get Latest Price
          </a>
          <AppLink
            href={href}
            aria-label={`View details of ${product.name}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-heading transition duration-200 ease-premium hover:border-heading hover:bg-brand-900 hover:text-white"
          >
            <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
          </AppLink>
        </div>
      </div>
    </article>
  );
}
