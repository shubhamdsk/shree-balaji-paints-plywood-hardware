"use client";

import type { ReactNode } from "react";
import ConfirmProvider from "@/providers/ConfirmProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import UnsavedChangesProvider from "@/providers/UnsavedChangesProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <UnsavedChangesProvider>{children}</UnsavedChangesProvider>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
