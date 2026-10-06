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
    <div className="border-b border-stone-200 bg-white">
      <div className={`mx-auto ${widths[width]} px-4 py-8 sm:px-6 sm:py-10`}>
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-4 text-3xl font-extrabold text-brand-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-stone-600">{description}</p>
      </div>
    </div>
  );
}
