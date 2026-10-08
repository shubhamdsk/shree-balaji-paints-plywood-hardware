"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LoaderCircle } from "@/components/ui/icons";

interface NavigationProgress {
  id: number;
  fromPath: string;
}

interface NavigationProgressContextValue {
  beginNavigation: (fromPath: string) => number;
}

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(null);

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) throw new Error("useNavigationProgress must be used within NavigationProgressProvider");
  return context;
}

export default function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nextId = useRef(0);
  const [progress, setProgress] = useState<NavigationProgress | null>(null);

  const beginNavigation = useCallback((fromPath: string) => {
    const id = ++nextId.current;
    setProgress({ id, fromPath });
    return id;
  }, []);

  useEffect(() => {
    if (!progress || progress.fromPath === pathname) return;
    const completedId = progress.id;
    const timeout = window.setTimeout(() => {
      setProgress((current) => (current?.id === completedId ? null : current));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname, progress]);

  const isLoading = progress !== null && progress.fromPath === pathname;

  return (
    <NavigationProgressContext.Provider value={{ beginNavigation }}>
      {children}
      {isLoading && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed inset-0 z-[100] grid place-items-center bg-canvas/90 text-heading backdrop-blur-sm"
        >
          <span className="flex flex-col items-center gap-3 font-semibold">
            <LoaderCircle aria-hidden className="h-10 w-10 animate-spin text-accent-600" />
            Loading page...
          </span>
        </div>
      )}
    </NavigationProgressContext.Provider>
  );
}