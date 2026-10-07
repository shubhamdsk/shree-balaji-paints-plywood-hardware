"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { applyTheme, DARK_SCHEME_QUERY, readThemePreference, subscribeThemePreference } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    // Also re-applies after React's dev-only remount clears attributes set by the inline script.
    const sync = () => applyTheme(readThemePreference());
    sync();
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    media.addEventListener("change", sync);
    const unsubscribe = subscribeThemePreference(sync);
    return () => {
      media.removeEventListener("change", sync);
      unsubscribe();
    };
  }, []);

  return children;
}
