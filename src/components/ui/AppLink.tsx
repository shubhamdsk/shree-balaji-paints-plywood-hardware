"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useUnsavedChangesContext } from "@/hooks/use-unsaved-changes";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export default function AppLink({ href, onNavigate, replace, scroll, ...props }: AppLinkProps) {
  const router = useRouter();
  const { hasUnsavedChanges, confirmDiscard } = useUnsavedChangesContext();

  return (
    <Link
      href={href}
      replace={replace}
      scroll={scroll}
      onNavigate={(event) => {
        onNavigate?.(event);
        if (!hasUnsavedChanges()) return;
        event.preventDefault();
        void confirmDiscard().then((confirmed) => {
          if (!confirmed) return;
          if (replace) router.replace(href, { scroll });
          else router.push(href, { scroll });
        });
      }}
      {...props}
    />
  );
}
