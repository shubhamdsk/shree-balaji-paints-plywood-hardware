"use client";

import { themeInitScript } from "@/lib/theme";

export default function ThemeScript() {
  return (
    <script
      // Runs only from the server HTML; React warns about executable scripts it renders on the client.
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
