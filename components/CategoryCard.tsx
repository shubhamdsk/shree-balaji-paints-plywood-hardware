import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Hammer,
  Layers,
  PaintBucket,
  Plug,
  Wrench,
} from "lucide-react";
import type { Category, CategoryId } from "@/types";

const styles: Record<
  CategoryId,
  { icon: typeof PaintBucket; gradient: string; shadow: string; border: string }
> = {
  paints: {
    icon: PaintBucket,
    gradient: "from-paint-red via-accent-500 to-paint-yellow",
    shadow: "rgba(220,38,38,0.35)",
    border: "group-hover:border-accent-300",
  },
  plywood: {
    icon: Layers,
    gradient: "from-amber-600 via-amber-700 to-amber-900",
    shadow: "rgba(180,83,9,0.35)",
    border: "group-hover:border-amber-400",
  },
  hardware: {
    icon: Hammer,
    gradient: "from-brand-500 via-brand-600 to-brand-800",
    shadow: "rgba(30,64,175,0.4)",
    border: "group-hover:border-brand-300",
  },
  plumbing: {
    icon: Droplets,
    gradient: "from-sky-600 via-sky-700 to-sky-900",
    shadow: "rgba(2,132,199,0.35)",
    border: "group-hover:border-sky-400",
  },
  electrical: {
    icon: Plug,
    gradient: "from-yellow-500 via-amber-600 to-orange-700",
    shadow: "rgba(217,119,6,0.35)",
    border: "group-hover:border-amber-400",
  },
  tools: {
    icon: Wrench,
    gradient: "from-stone-600 via-stone-700 to-stone-900",
    shadow: "rgba(68,64,60,0.35)",
    border: "group-hover:border-stone-400",
  },
  adhesives: {
    icon: Layers,
    gradient: "from-emerald-600 via-emerald-700 to-teal-900",
    shadow: "rgba(5,150,105,0.35)",
    border: "group-hover:border-emerald-400",
  },
};

export default function CategoryCard({ category, count }: { category: Category; count: number }) {
  const { icon: Icon, gradient, shadow, border } = styles[category.id];

  return (
    <Link
      href={`/products?category=${category.id}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 ${border} hover:shadow-[0_20px_45px_-15px_var(--card-shadow)]`}
      style={{ ["--card-shadow" as string]: shadow }}
    >
      <div className="relative h-36 sm:h-40">
        <Image
          src={category.image}
          alt={`${category.name} — ${category.tagline}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-75 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        <div
          className={`absolute bottom-4 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-[0_10px_28px_-8px_var(--icon-shadow)] ring-2 ring-white/40`}
          style={{ ["--icon-shadow" as string]: shadow }}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-xs font-bold tracking-wider text-accent-600 uppercase">{category.tagline}</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">{category.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{category.description}</p>
        <div className="mt-6 flex items-center justify-between text-sm font-bold">
          <span className="text-slate-600">{count}+ products</span>
          <span className="flex items-center gap-1 text-brand-600 transition-all group-hover:gap-2">
            Browse <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
