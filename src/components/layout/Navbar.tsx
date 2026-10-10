"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Calculator, ClipboardList, Menu, Phone, WhatsAppIcon, X } from "@/components/ui/icons";
import Logo from "@/components/brand/Logo";
import { isActivePath, NAV_LINKS } from "@/components/layout/nav-links";
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { shop, whatsappLink } from "@/config/shop";
import { ROUTES } from "@/lib/routes";

const SCROLL_COMPACT_PX = 12;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_COMPACT_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md transition-[box-shadow,border-color] duration-300 ${
        scrolled ? "border-transparent shadow-header" : "border-line"
      }`}
    >
      <nav
        aria-label="Main"
        className={`container-page flex items-center justify-between gap-3 transition-[padding] duration-300 ease-premium ${
          scrolled ? "py-2" : "py-3 lg:py-4"
        }`}
      >
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(link.href, pathname);
            return (
              <li key={link.label}>
                <AppLink
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-lg px-2.5 py-2 text-[15px] font-semibold transition-colors after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-colors xl:px-3 ${
                    active
                      ? "text-accent-600 after:bg-accent-600"
                      : "text-heading after:bg-transparent hover:text-accent-600"
                  }`}
                >
                  {link.label}
                </AppLink>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden lg:block">
            <ThemeSwitcher />
          </div>
          <div className="hidden sm:block lg:hidden xl:block">
            <a
              href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("whatsapp")}
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              WhatsApp Us
            </a>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-heading hover:bg-surface-muted lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="no-scrollbar max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-line bg-card lg:hidden">
          <ul className="container-page grid gap-1 pt-3 pb-40">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(link.href, pathname);
              return (
                <li key={link.label}>
                  <AppLink
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-xl px-3 text-base font-semibold ${
                      active ? "bg-accent-50 text-accent-700" : "text-heading hover:bg-surface-muted"
                    }`}
                  >
                    {link.label}
                  </AppLink>
                </li>
              );
            })}
            <li className="mt-1 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <AppLink
                href={ROUTES.enquiry()}
                onClick={() => setOpen(false)}
                className={buttonClasses("secondary", "w-full")}
              >
                <ClipboardList className="h-4 w-4" /> Enquiry
              </AppLink>
              <AppLink
                href={ROUTES.paintCalculator()}
                onClick={() => setOpen(false)}
                className={buttonClasses("secondary", "w-full")}
              >
                <Calculator className="h-4 w-4" /> Paint calculator
              </AppLink>
              <a href={shop.phoneLink} className={buttonClasses("primary", "w-full")}>
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("whatsapp", "w-full")}
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </li>
            <li className="pt-2">
              <ThemeSwitcher showLabel />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
