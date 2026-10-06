import type { ComponentProps } from "react";
import { vi } from "vitest";

export const linkNavigated = vi.fn();

type MockLinkProps = ComponentProps<"a"> & {
  href: string;
  onNavigate?: (event: { preventDefault: () => void }) => void;
};

export default function MockLink({ href, onNavigate, ...props }: MockLinkProps) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        let prevented = false;
        onNavigate?.({ preventDefault: () => (prevented = true) });
        if (!prevented) linkNavigated(href);
      }}
    />
  );
}
