import AdminNav from "@/components/admin/AdminNav";
import Logo from "@/components/brand/Logo";
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { Store } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";
import { logOutAction } from "@/server/actions/auth";

export default function AdminHeader({ username }: { username: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2 lg:flex-nowrap">
        <Logo compact />
        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:order-last">
          <span className="hidden text-sm text-muted xl:inline">Logged in as {username}</span>
          <AppLink href={ROUTES.home} className={buttonClasses("secondary", "max-sm:hidden")}>
            View website
          </AppLink>
          <AppLink
            href={ROUTES.home}
            aria-label="View website"
            title="View website"
            className="grid h-11 w-11 place-items-center rounded-full text-heading transition hover:bg-surface-muted sm:hidden"
          >
            <Store aria-hidden className="h-5 w-5" />
          </AppLink>
          <ThemeSwitcher />
          <form action={logOutAction}>
            <button type="submit" className={buttonClasses("secondary")}>
              Log out
            </button>
          </form>
        </div>
        <AdminNav />
      </div>
    </header>
  );
}
