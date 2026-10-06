import Image from "next/image";
import { ArrowRight } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";

export default function PromoBanners() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
      <AppLink
        href="/products?category=paints&type=Interior"
        className="relative flex min-h-[200px] overflow-hidden rounded-3xl bg-indigo-950 card-shadow-lg sm:min-h-[240px]"
      >
        <Image
          src="/images/banners/interior-living.jpg"
          alt="Cosy interior living room"
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-900/75 to-indigo-900/20" />
        <div className="relative flex flex-col justify-center p-6 sm:p-8">
          <p className="text-xs font-bold tracking-wider text-indigo-200 uppercase">Collection</p>
          <h3 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">Interior Paints</h3>
          <p className="mt-2 max-w-xs text-sm text-indigo-100">Washable emulsions & shade matching in store.</p>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-indigo-900">
            Shop Now <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </AppLink>

      <AppLink
        href="/products?category=paints&type=Exterior"
        className="relative flex min-h-[200px] overflow-hidden rounded-3xl bg-orange-950 card-shadow-lg sm:min-h-[240px]"
      >
        <Image
          src="/images/banners/exterior-house.jpg"
          alt="Modern house exterior"
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/95 via-orange-900/70 to-orange-900/15" />
        <div className="relative flex flex-col justify-center p-6 sm:p-8">
          <p className="text-xs font-bold tracking-wider text-orange-200 uppercase">Weather shield</p>
          <h3 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">Exterior Paints</h3>
          <p className="mt-2 max-w-xs text-sm text-orange-100">Long-lasting colours for Indian sun and rain.</p>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-orange-900">
            Shop Now <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </AppLink>
    </div>
  );
}
