import Image from "next/image";
import { ArrowRight } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { ROUTES } from "@/lib/routes";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  counts: Record<string, number>;
}

function countLabel(n: number) {
  return `${n} product${n === 1 ? "" : "s"}`;
}

export default function CategoryShowcase({ categories, counts }: Props) {
  const [lead, ...rest] = categories;
  if (!lead) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:grid-rows-2">
      <li className="col-span-2 md:col-span-3 lg:col-span-2 lg:row-span-2">
        <AppLink
          href={ROUTES.category(lead.id)}
          className="group relative flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-card bg-brand-900 p-5 shadow-card sm:min-h-72 sm:p-7 lg:min-h-[26rem]"
        >
          <Image
            src={lead.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="img-zoom object-cover"
          />
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-brand-950/90 via-brand-950/40 to-transparent" />
          <span className="relative">
            <span className="inline-block rounded-md bg-paint-500 px-2 py-0.5 text-xs font-bold tracking-wide text-brand-950 uppercase">
              Most popular
            </span>
            <span className="mt-3 block text-3xl font-bold text-white sm:text-4xl">{lead.name}</span>
            <span className="mt-1 block max-w-md text-[15px] text-brand-100">{lead.tagline}</span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
              Explore {lead.name} · {countLabel(counts[lead.id] ?? 0)}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </span>
        </AppLink>
      </li>

      {rest.map((c) => (
        <li key={c.id}>
          <AppLink
            href={ROUTES.category(c.id)}
            className="group card-lift flex h-full flex-col overflow-hidden rounded-card border border-line bg-card"
          >
            <span className="relative block aspect-[4/3] overflow-hidden bg-surface-muted">
              <Image src={c.image} alt="" fill sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw" className="img-zoom object-cover" />
            </span>
            <span className="flex flex-1 items-center justify-between gap-2 p-3 sm:p-4">
              <span className="min-w-0">
                <span className="block text-[15px] leading-tight font-semibold text-heading sm:text-base">{c.name}</span>
                <span className="mt-0.5 block text-[13px] text-muted">{countLabel(counts[c.id] ?? 0)}</span>
              </span>
              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-accent-600 transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </AppLink>
        </li>
      ))}
    </ul>
  );
}
