"use client";

import type { ReactNode } from "react";
import ConfirmProvider from "@/providers/ConfirmProvider";
import UnsavedChangesProvider from "@/providers/UnsavedChangesProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      <UnsavedChangesProvider>{children}</UnsavedChangesProvider>
    </ConfirmProvider>
  );
}
