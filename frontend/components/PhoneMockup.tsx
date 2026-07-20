"use client";

import { useState } from "react";
import { Signal, Wifi, BatteryFull, Home, LineChart, Bell, User } from "lucide-react";
import { useCountdown } from "@/lib/useCountdown";
import OrbitalRing from "@/components/OrbitalRing";

const CHIPS = ["All", "Crypto", "Stocks", "Sports", "Politics"];

interface MarketRow {
  icon: string;
  color: string;
  question: string;
  confidence: number;
  tag: string;
  up: boolean;
}

const MARKETS: MarketRow[] = [
  { icon: "B", color: "#f7931a", question: "Will BTC hit $70,000 this week?", confidence: 68, tag: "Bullish", up: true },
  { icon: "N", color: "#0ea5e9", question: "Will NVDA close green today?", confidence: 74, tag: "Bullish", up: true },
  { icon: "L", color: "#a855f7", question: "Will the Lakers win tonight?", confidence: 55, tag: "Lakers", up: true },
  { icon: "P", color: "#ef4444", question: "Will Trump win the primary vote?", confidence: 62, tag: "Trump", up: false },
];

function Sparkline({ up }: { up: boolean }) {
  const points = up ? "0,14 8,10 16,11 24,5 32,6 40,1" : "0,2 8,6 16,4 24,9 32,8 40,14";
  return (
    <svg viewBox="0 0 40 16" width={40} height={16} className="shrink-0" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={up ? "#4ade80" : "#f87171"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LiveCountdown() {
  const [target] = useState(() => Date.now() + (2 * 3600 + 47 * 60) * 1000);
  const timeLeft = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="font-mono text-lg font-semibold tabular-nums text-text-primary">
      {timeLeft ? `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}` : "--:--:--"}
    </span>
  );
}

function TabIcon({ icon: Icon }: { icon: typeof Home }) {
  return <Icon size={18} className="text-text-secondary" />;
}

export default function PhoneMockup() {
  return (
    <div className="relative mx-auto flex w-full max-w-[400px] items-center justify-center py-10">
      <div
        className="pointer-events-none absolute bottom-6 left-1/2 h-16 w-64 -translate-x-1/2 rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse, var(--vault-glow) 0%, transparent 70%)" }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.15]">
        <OrbitalRing size={440} />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
        <OrbitalRing size={520} />
      </div>

      <div className="phone-float relative z-10 w-full">
        <div
          className="relative mx-auto w-full max-w-[380px] rounded-[44px] p-[3px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]"
          style={{
            background:
              "linear-gradient(155deg, #5a5b64 0%, #1c1c22 35%, #0a0a0d 55%, #38393f 80%, #6b6c76 100%)",
          }}
        >
          <div className="relative overflow-hidden rounded-[41px] bg-black p-[8px]">
            <div className="relative overflow-hidden rounded-[34px] bg-bg-void">
              <div
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    "linear-gradient(125deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 28%)",
                }}
              />
              <div className="absolute left-1/2 top-3 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

              <div className="relative z-10 flex flex-col pb-4">
                <div className="flex items-center justify-between px-6 pt-4 text-[11px] font-semibold text-text-primary">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal size={12} />
                    <Wifi size={12} />
                    <BatteryFull size={14} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between px-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vault-blue/15 text-sm font-bold text-vault-blue">
                    V
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                      Live Now
                    </span>
                  </div>
                </div>

                <div className="mx-5 mt-4 rounded-2xl border border-border-subtle bg-surface p-4">
                  <p className="text-xs font-semibold text-text-primary">
                    Market Outlook — <span className="text-text-secondary">With The Observer</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <LiveCountdown />
                    <button
                      type="button"
                      className="rounded-full bg-vault-blue px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_0_16px_var(--vault-glow)]"
                    >
                      Join Live
                    </button>
                  </div>
                </div>

                <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto px-5">
                  {CHIPS.map((chip, i) => (
                    <span
                      key={chip}
                      className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        i === 0
                          ? "bg-vault-blue text-white"
                          : "border border-border-subtle text-text-secondary"
                      }`}
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-3">
                  {MARKETS.map((market) => (
                    <div
                      key={market.question}
                      className="flex items-center gap-3 border-t border-border-subtle px-5 py-3 first:border-t-0"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: market.color }}
                      >
                        {market.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-text-primary">{market.question}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Sparkline up={market.up} />
                          <span
                            className={`text-[10px] font-bold ${market.up ? "text-green-400" : "text-red-400"}`}
                          >
                            {market.confidence}%
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                              market.up ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {market.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-around border-t border-border-subtle px-4 pt-3">
                  <TabIcon icon={Home} />
                  <TabIcon icon={LineChart} />
                  <div className="relative -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-vault-blue text-sm font-bold text-white shadow-[0_4px_20px_var(--vault-glow)]">
                    V
                  </div>
                  <TabIcon icon={Bell} />
                  <TabIcon icon={User} />
                </div>

                <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-text-secondary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
