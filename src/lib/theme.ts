export const THEME_PREFERENCES = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export const THEME_STORAGE_KEY = "theme";
export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return THEME_PREFERENCES.find((theme) => theme === value) ?? "system";
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

export function readThemePreference(): ThemePreference {
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function applyTheme(preference: ThemePreference) {
  const systemPrefersDark = window.matchMedia(DARK_SCHEME_QUERY).matches;
  document.documentElement.dataset.theme = resolveTheme(preference, systemPrefersDark);
}

const listeners = new Set<() => void>();

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the choice still applies to this page.
  }
  applyTheme(preference);
  listeners.forEach((listener) => listener());
}

export function subscribeThemePreference(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const themeInitScript = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}var d=t==="dark"||(t!=="light"&&matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches);document.documentElement.dataset.theme=d?"dark":"light"})()`;
