"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useConfirm } from "@/hooks/use-confirm";

interface UnsavedChangesContextValue {
  setDirty: (sourceId: string, isDirty: boolean) => void;
  hasUnsavedChanges: () => boolean;
  confirmDiscard: () => Promise<boolean>;
}

export const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export default function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const confirm = useConfirm();
  const dirtySourcesRef = useRef(new Set<string>());
  const [isDirty, setIsDirty] = useState(false);

  const setDirty = useCallback((sourceId: string, dirty: boolean) => {
    const sources = dirtySourcesRef.current;
    if (dirty) sources.add(sourceId);
    else sources.delete(sourceId);
    setIsDirty(sources.size > 0);
  }, []);

  const hasUnsavedChanges = useCallback(() => dirtySourcesRef.current.size > 0, []);

  const confirmDiscard = useCallback(async () => {
    if (dirtySourcesRef.current.size === 0) return true;
    const confirmed = await confirm({
      title: "Discard unsaved changes?",
      message: "You have changes that are not saved yet. If you leave now, they will be lost.",
      confirmLabel: "Discard changes",
      cancelLabel: "Keep editing",
      tone: "danger",
    });
    if (confirmed) {
      dirtySourcesRef.current.clear();
      setIsDirty(false);
    }
    return confirmed;
  }, [confirm]);

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  const value = useMemo(
    () => ({ setDirty, hasUnsavedChanges, confirmDiscard }),
    [setDirty, hasUnsavedChanges, confirmDiscard],
  );

  return <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>;
}
