"use client";

import { useContext, useEffect, useId } from "react";
import { UnsavedChangesContext } from "@/providers/UnsavedChangesProvider";

export function useUnsavedChangesContext() {
  const context = useContext(UnsavedChangesContext);
  if (!context) throw new Error("Unsaved changes hooks must be used inside <UnsavedChangesProvider>");
  return context;
}

export function useUnsavedChanges(isDirty: boolean) {
  const sourceId = useId();
  const { setDirty, confirmDiscard } = useUnsavedChangesContext();

  useEffect(() => {
    setDirty(sourceId, isDirty);
    return () => setDirty(sourceId, false);
  }, [sourceId, isDirty, setDirty]);

  return { confirmDiscard };
}
