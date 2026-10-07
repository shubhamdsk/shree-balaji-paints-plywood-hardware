"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@/components/ui/icons";

const SHOW_AFTER_PX = 600;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      inert={!visible}
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0 })}
      className={`grid h-12 w-12 place-items-center rounded-full border border-line bg-card text-heading shadow-card-hover transition duration-300 ease-premium hover:border-heading ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
