"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ComponentProps } from "react";
import { useUnsavedChangesContext } from "@/hooks/use-unsaved-changes";
import { useNavigationProgress } from "@/providers/NavigationProgressProvider";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export default function AppLink({ href, onNavigate, replace, scroll, className, children, ...props }: AppLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasUnsavedChanges, confirmDiscard } = useUnsavedChangesContext();
  const { beginNavigation: beginProgressNavigation } = useNavigationProgress();
  const navigationLock = useRef(false);
  const confirmingDiscard = useRef(false);

  useEffect(() => {
    navigationLock.current = false;
    confirmingDiscard.current = false;
  }, [pathname]);

  const beginNavigation = () => {
    navigationLock.current = true;
    beginProgressNavigation(pathname);
  };

  const targetPath = href.split(/[?#]/, 1)[0];

  return (
    <Link
      href={href}
      replace={replace}
      scroll={scroll}
      prefetch={props.prefetch}
      className={className}
      onNavigate={(event) => {
        onNavigate?.(event);

        if (navigationLock.current || confirmingDiscard.current) {
          event.preventDefault();
          return;
        }
        if (targetPath === pathname) return;
        if (!hasUnsavedChanges()) {
          beginNavigation();
          return;
        }

        event.preventDefault();
        confirmingDiscard.current = true;
        void confirmDiscard().then((confirmed) => {
          confirmingDiscard.current = false;
          if (!confirmed || navigationLock.current) return;
          beginNavigation();
          if (replace) router.replace(href, { scroll });
          else router.push(href, { scroll });
        });
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
