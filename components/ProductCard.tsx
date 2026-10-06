import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { Product } from "@/types";
import { whatsappLink } from "@/data/shop";

function productImage(product: Product) {
  return product.gallery?.[0] ?? product.image ?? `/images/categories/${product.category}.jpg`;
}

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const src = productImage(product);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white card-shadow transition hover:border-orange-200">
      <Link href={`/products/${product.id}`} className="relative block h-44 bg-stone-50 sm:h-48">
        <Image
          src={src}
          alt={`${product.name} — ${product.type}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
        {!product.inStock && (
          <span className="absolute top-3 right-3 rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-bold text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? "p-3" : "p-4 sm:p-5"}`}>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{product.brand}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="mt-0.5 text-base leading-snug font-bold text-brand-900 hover:text-accent-600 sm:text-lg">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs font-medium text-stone-500">{product.type}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {product.sizes.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold text-stone-700 sm:text-xs"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-accent-600 hover:text-accent-700"
          >
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href={whatsappLink(`Hello, I want to enquire about ${product.brand} ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp enquiry for ${product.name}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:brightness-105"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </div>
    </article>
  );
}
