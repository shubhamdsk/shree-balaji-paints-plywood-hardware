"use client";

import { useSyncExternalStore } from "react";
import {
  readThemePreference,
  setThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "@/lib/theme";

const serverPreference = (): ThemePreference => "system";

export function useTheme() {
  const preference = useSyncExternalStore(subscribeThemePreference, readThemePreference, serverPreference);
  return { preference, setPreference: setThemePreference };
}
