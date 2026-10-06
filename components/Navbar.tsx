"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Menu, MessageCircle, Search, X } from "lucide-react";
import Logo from "./Logo";
import { shop, whatsappLink } from "@/data/shop";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/#brands", label: "Brands" },
  { href: "/#offers", label: "Offers" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Logo />

        <ul className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/products"
                  ? pathname.startsWith("/products")
                  : false;
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active ? "text-accent-600" : "text-stone-700 hover:text-accent-600"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/products"
            aria-label="Search products"
            className="grid h-10 w-10 place-items-center rounded-full text-stone-700 transition hover:bg-stone-100"
          >
            <Search className="h-5 w-5" />
          </Link>
          <a
            href={whatsappLink(`Hello ${shop.shortName}, I would like to enquire about products.`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Product enquiry"
            className="hidden h-10 w-10 place-items-center rounded-full text-stone-700 transition hover:bg-stone-100 sm:grid"
          >
            <ClipboardList className="h-5 w-5" />
          </a>
          <a
            href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            WhatsApp Us
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-stone-800 hover:bg-stone-100 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-stone-200 bg-white px-4 pb-4 lg:hidden">
          <ul className="flex flex-col py-2">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block min-h-11 rounded-lg px-3 py-3 font-semibold text-stone-800 hover:bg-stone-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Us
          </a>
        </div>
      )}
    </header>
  );
}
