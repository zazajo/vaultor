"use client";

import { useEffect, useState } from "react";
import { getConfig } from "@/lib/api";
import { useCountdown, type TimeLeft } from "@/lib/useCountdown";

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export default function Countdown() {
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getConfig()
      .then((config) => {
        if (!cancelled && config.presale_start) {
          setTarget(new Date(config.presale_start).getTime());
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const timeLeft = useCountdown(target);

  return (
    <div className="flex items-stretch divide-x divide-border-subtle rounded-lg border border-border-subtle font-mono">
      {UNITS.map((unit) => (
        <div key={unit.key} className="flex flex-col items-center gap-0.5 px-2.5 py-2 sm:px-4 sm:py-2.5">
          <span className="text-base tabular-nums text-text-primary sm:text-lg">
            {timeLeft ? String(timeLeft[unit.key]).padStart(2, "0") : "--"}
          </span>
          <span className="text-[8px] uppercase tracking-wide text-text-secondary sm:text-[10px]">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
