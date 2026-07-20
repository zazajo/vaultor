"use client";

import { useEffect, useState } from "react";
import { getRoadmap, type Phase } from "@/lib/api";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M4 8.5L6.5 11L12 5"
        stroke="white"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Timeline() {
  const [phases, setPhases] = useState<Phase[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRoadmap()
      .then((data) => {
        if (!cancelled) setPhases(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!phases || phases.length === 0) return null;

  const currentIndex = phases.findIndex((p) => p.status === "current");
  const completedCount = phases.filter((p) => p.status === "complete").length;
  const progressIndex = currentIndex >= 0 ? currentIndex : Math.max(completedCount - 1, 0);
  const progress = phases.length > 1 ? (progressIndex / (phases.length - 1)) * 100 : 0;

  return (
    <div className="scrollbar-none overflow-x-auto pb-2 pt-6">
      <div className="relative mx-auto flex min-w-max px-6">
        <span className="pointer-events-none absolute left-[90px] right-[90px] top-[22px] h-px bg-border-subtle" />
        <span
          className="pointer-events-none absolute left-[90px] top-[22px] h-px bg-vault-blue transition-[width] duration-700 ease-out"
          style={{ width: `calc((100% - 180px) * ${progress / 100})` }}
        />
        {phases.map((phase, i) => (
          <div key={phase.id} className="flex w-[180px] shrink-0 flex-col items-center text-center">
            <div className="relative z-10 flex h-11 w-11 items-center justify-center">
              {phase.status === "complete" && (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-vault-blue">
                  <CheckIcon />
                </div>
              )}
              {phase.status === "current" && (
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-vault-blue shadow-[0_0_20px_var(--vault-glow)]">
                  <span className="node-pulse absolute inset-0 rounded-full border border-vault-blue" />
                  <span className="font-mono text-sm text-vault-blue">{i + 1}</span>
                </div>
              )}
              {phase.status === "coming_soon" && (
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle opacity-60">
                  <span className="font-mono text-sm text-text-secondary">{i + 1}</span>
                </div>
              )}
            </div>
            <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-text-primary">
              {phase.title}
            </span>
            <span className="mt-1.5 line-clamp-2 text-xs text-text-secondary">
              {phase.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
