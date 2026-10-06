import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

export default function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="flex w-[140px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white card-shadow sm:w-[160px]"
    >
      <div className="relative h-28 sm:h-32">
        <Image src={category.image} alt={category.name} fill sizes="160px" className="object-cover" />
      </div>
      <div className="flex items-center justify-between px-3 py-3">
        <span className="text-sm font-bold text-brand-900">{category.name}</span>
        <ArrowRight className="h-4 w-4 text-accent-500 opacity-70" />
      </div>
    </Link>
  );
}
