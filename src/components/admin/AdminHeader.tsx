import AdminNav from "@/components/admin/AdminNav";
import Logo from "@/components/brand/Logo";
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { logOutAction } from "@/server/actions/auth";

export default function AdminHeader({ username }: { username: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
        <Logo compact />
        <AdminNav />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <span className="hidden text-sm text-muted sm:inline">Logged in as {username}</span>
          <AppLink href={ROUTES.home} className={buttonClasses("secondary", "hidden sm:inline-flex")}>
            View website
          </AppLink>
          <ThemeSwitcher />
          <form action={logOutAction}>
            <button type="submit" className={buttonClasses("secondary")}>
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
