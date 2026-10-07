import Image from "next/image";
import { ArrowRight } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { shop } from "@/config/shop";
import { ROUTES } from "@/lib/routes";

export default function StoreStory() {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="grid grid-cols-5 gap-3">
        <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-card border border-line shadow-card">
          <Image
            src="/images/shop/storefront.jpg"
            alt="Paint and hardware store storefront"
            fill
            sizes="(max-width: 1024px) 60vw, 30vw"
            className="object-cover"
          />
        </div>
        <div className="col-span-2 grid grid-rows-[1fr_auto] gap-3">
          <div className="relative overflow-hidden rounded-card border border-line shadow-card">
            <Image
              src="/images/shop/interior.jpg"
              alt="Store shelves stocked with paint and building supplies"
              fill
              sizes="(max-width: 1024px) 40vw, 20vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center rounded-card bg-brand-900 p-4 text-white shadow-card-hover">
            <span className="text-3xl font-bold text-gold-300 sm:text-4xl">7</span>
            <span className="text-[13px] leading-snug text-brand-100 sm:text-sm">days a week, {shop.hoursShort}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-bold tracking-[0.14em] text-accent-600 uppercase">About us</p>
        <h2 lang="mr" className="mt-2 text-[1.65rem] leading-tight font-bold text-heading sm:text-3xl lg:text-[2.25rem]">
          आपल्या घरासाठी, आपल्या माणसांकडून.
        </h2>
        <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-gold-500" />
        <p className="mt-5 text-base leading-relaxed text-muted">
          {shop.marathi.fullName} is a local store in {shop.address.city}. Homeowners, painters, carpenters
          and contractors come to us for genuine products, straight answers and a fair price.
        </p>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Whether you are building a new home or repainting one room, we help you choose what will last.
        </p>
        <AppLink href={ROUTES.about} className={buttonClasses("primary", "mt-7 w-full sm:w-auto")}>
          More about the store <ArrowRight className="h-4 w-4" />
        </AppLink>
      </div>
    </div>
  );
}
