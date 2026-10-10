import Image from "next/image";
import { Package } from "@/components/ui/icons";

interface CoverImageProps {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

export default function CoverImage({ src, alt, sizes, className = "object-cover", priority }: CoverImageProps) {
  if (src) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className="absolute inset-0 grid place-items-center bg-linear-to-br from-brand-700 to-brand-950"
    >
      <Package aria-hidden className="h-1/4 max-h-16 w-1/4 max-w-16 text-brand-200/70" />
    </span>
  );
}
