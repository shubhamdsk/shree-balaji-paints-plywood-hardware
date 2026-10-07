import type { ReactNode } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const widths = { wide: "max-w-7xl", narrow: "max-w-3xl" } as const;

interface PageHeaderProps {
  title: string;
  description: ReactNode;
  width?: keyof typeof widths;
  parents?: { label: string; href: string }[];
}

export default function PageHeader({ title, description, width = "wide", parents = [] }: PageHeaderProps) {
  const crumbs = [{ label: "Home", href: "/" }, ...parents, { label: title }];

  return (
    <div className="relative overflow-hidden border-b border-line bg-linear-to-b from-white to-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-paint-100/60 blur-3xl"
      />
      <div className={`relative mx-auto ${widths[width]} px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12`}>
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-4 text-[1.75rem] leading-tight font-extrabold text-brand-900 sm:text-4xl lg:text-[2.5rem]">
          {title}
        </h1>
        <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-gold-500" />
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>
      </div>
    </div>
  );
}
