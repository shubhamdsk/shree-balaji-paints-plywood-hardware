"use client";

import { buttonClasses } from "@/components/ui/Button";
import { Monitor, Moon, Sun, type Icon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/use-theme";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: Record<ThemePreference, { label: string; Icon: Icon; next: ThemePreference }> = {
  light: { label: "Light", Icon: Sun, next: "dark" },
  dark: { label: "Dark", Icon: Moon, next: "system" },
  system: { label: "System", Icon: Monitor, next: "light" },
};

interface ThemeSwitcherProps {
  showLabel?: boolean;
}

export default function ThemeSwitcher({ showLabel = false }: ThemeSwitcherProps) {
  const { preference, setPreference } = useTheme();
  const { label, Icon, next } = OPTIONS[preference];
  const description = `Theme: ${label}. Switch to ${OPTIONS[next].label}`;

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={description}
      title={description}
      className={
        showLabel
          ? buttonClasses("secondary", "w-full")
          : "grid h-11 w-11 place-items-center rounded-full text-heading transition hover:bg-surface-muted"
      }
    >
      <Icon aria-hidden className={showLabel ? "h-4 w-4" : "h-5 w-5"} />
      {showLabel && `Theme: ${label}`}
    </button>
  );
}
