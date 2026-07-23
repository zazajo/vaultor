"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CosmicBackground from "@/components/CosmicBackground";
import OrbitalRing from "@/components/OrbitalRing";

const MIN_DISPLAY_MS = 1100;
const FADE_MS = 500;

type Phase = "visible" | "exiting" | "hidden";

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>("visible");

  useEffect(() => {
    const start = Date.now();
    const startExit = () => {
      const elapsed = Date.now() - start;
      window.setTimeout(() => setPhase("exiting"), Math.max(MIN_DISPLAY_MS - elapsed, 0));
    };

    if (document.readyState === "complete") {
      startExit();
      return;
    }
    window.addEventListener("load", startExit);
    return () => window.removeEventListener("load", startExit);
  }, []);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = window.setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    document.body.style.overflow = phase === "hidden" ? "" : "hidden";
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-void transition-opacity ease-out ${
        phase === "exiting" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <CosmicBackground />

      <div className="relative z-10 flex flex-col items-center gap-7">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="orb-gradient orb-breathe absolute inset-[-40%] rounded-full blur-2xl" />
          <OrbitalRing className="absolute inset-[-45%] opacity-40" />
          <div className="relative h-14 w-14 overflow-hidden rounded-xl shadow-[0_0_30px_var(--vault-glow)]">
            <Image src="/images/shield.jpg" alt="" fill sizes="56px" priority className="object-cover" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-text-primary">
            Vaultor
          </span>
          <div className="h-px w-32 overflow-hidden bg-border-subtle">
            <div className="preloader-bar h-full w-full bg-vault-blue" />
          </div>
        </div>
      </div>
    </div>
  );
}
