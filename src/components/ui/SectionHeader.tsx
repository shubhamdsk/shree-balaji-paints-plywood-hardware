import AppLink from "@/components/ui/AppLink";
import { ArrowRight } from "@/components/ui/icons";
import Reveal from "@/components/ui/Reveal";

interface SectionHeaderProps {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

export default function SectionHeader({ title, description, href, linkLabel }: SectionHeaderProps) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{title}</h2>
        <p className="mt-1 text-stone-600">{description}</p>
      </div>
      <AppLink
        href={href}
        className="inline-flex items-center gap-1 text-sm font-bold text-accent-600 hover:text-accent-700"
      >
        {linkLabel} <ArrowRight className="h-4 w-4" />
      </AppLink>
    </Reveal>
  );
}
