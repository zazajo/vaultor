"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

export default function IntroVideo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="metal-ring flex w-full items-center justify-center gap-3 rounded-full border border-transparent bg-transparent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-text-primary shadow-[0_0_24px_-8px_var(--vault-glow)] transition-shadow duration-300 hover:text-vault-blue hover:shadow-[0_0_36px_-6px_var(--vault-glow)] sm:w-auto"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-vault-blue text-vault-blue">
          <Play size={11} fill="currentColor" />
        </span>
        Watch Intro
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-void/90 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:text-vault-blue"
            >
              <X size={18} />
            </button>
            <video
              src="/video/intro.mp4"
              controls
              autoPlay
              className="w-full rounded-xl shadow-[0_0_60px_-10px_var(--vault-glow)]"
            />
          </div>
        </div>
      )}
    </>
  );
}
