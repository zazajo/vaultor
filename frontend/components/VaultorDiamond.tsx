"use client";

import { useEffect, useId, useRef, useState } from "react";

const SEED_R = 16;
// 6 circle centers at 60-degree intervals around (50,50), radius SEED_R.
const SEED_CENTERS = [
  [66, 50],
  [58, 63.86],
  [42, 63.86],
  [34, 50],
  [42, 36.14],
  [58, 36.14],
] as const;

export default function VaultorDiamond({
  size = 48,
  glow = 0.6,
  withV = true,
  variant = "static",
  className,
}: {
  size?: number;
  /** 0 (no glow) to 1 (full glow) */
  glow?: number;
  withV?: boolean;
  /** "constructing" draws the geometry in sequence once when scrolled into view */
  variant?: "static" | "constructing";
  className?: string;
}) {
  const id = useId();
  const coreId = `${id}-core`;
  const crownId = `${id}-crown`;
  const pavId = `${id}-pav`;
  const goldId = `${id}-gold`;

  const svgRef = useRef<SVGSVGElement>(null);
  const [play, setPlay] = useState(false);
  const constructing = variant === "constructing";

  useEffect(() => {
    if (!constructing || !svgRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [constructing]);

  const delay = (s: number) => ({ "--vd-delay": `${s}s` }) as React.CSSProperties;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${constructing ? `vd-constructing ${play ? "vd-play" : ""}` : ""} ${className ?? ""}`}
      style={glow > 0 ? { filter: `drop-shadow(0 0 ${Math.round(10 * glow)}px var(--vault-glow))` } : undefined}
      aria-hidden
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor="var(--vault-blue)" stopOpacity={0.85 * glow} />
          <stop offset="55%" stopColor="var(--vault-blue)" stopOpacity={0.25 * glow} />
          <stop offset="100%" stopColor="var(--vault-blue)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={crownId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ea8ff" />
          <stop offset="100%" stopColor="#2563ff" />
        </linearGradient>
        <linearGradient id={pavId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563ff" />
          <stop offset="100%" stopColor="#0a1030" />
        </linearGradient>
        <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8d5a3" />
          <stop offset="50%" stopColor="#c9a86a" />
          <stop offset="100%" stopColor="#8a6f3d" />
        </linearGradient>
      </defs>

      {/* Seed-of-Life construction geometry, faint, behind everything */}
      <g stroke={`url(#${goldId})`} strokeWidth="0.5" fill="none" opacity="0.22">
        <circle cx="50" cy="50" r={SEED_R} pathLength={1} className="vd-draw" style={delay(0)} />
        {SEED_CENTERS.map(([cx, cy], i) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={SEED_R}
            pathLength={1}
            className="vd-draw"
            style={delay(0.06 * (i + 1))}
          />
        ))}
        <circle cx="50" cy="50" r="34" opacity="0.7" pathLength={1} className="vd-draw" style={delay(0.3)} />
        <circle cx="50" cy="50" r="46" opacity="0.4" pathLength={1} className="vd-draw" style={delay(0.4)} />
      </g>

      {/* Vesica Piscis emphasis pulse, only during the constructing sequence */}
      {constructing && (
        <g stroke={`url(#${goldId})`} strokeWidth="0.8" fill="none" opacity="0" className="vd-vesica" style={delay(0.5)}>
          <circle cx="42" cy="50" r={SEED_R} />
          <circle cx="58" cy="50" r={SEED_R} />
        </g>
      )}

      {/* Fills: core glow, facets, negative-space V */}
      <g className="vd-fill" style={delay(1.55)}>
        <circle cx="50" cy="46" r="30" fill={`url(#${coreId})`} />

        <polygon points="50,12 22,44 38,44" fill={`url(#${crownId})`} opacity="0.55" />
        <polygon points="50,12 38,44 62,44" fill={`url(#${crownId})`} opacity="0.9" />
        <polygon points="50,12 62,44 78,44" fill={`url(#${crownId})`} opacity="0.55" />

        <polygon points="22,44 38,44 50,88" fill={`url(#${pavId})`} opacity="0.6" />
        <polygon points="38,44 62,44 50,88" fill={`url(#${pavId})`} opacity="0.95" />
        <polygon points="62,44 78,44 50,88" fill={`url(#${pavId})`} opacity="0.6" />

        {withV && (
          <path
            d="M43 47 L50 73 L57 47 L52.8 47 L50 60.5 L47.2 47 Z"
            fill="var(--bg-void)"
            opacity="0.82"
          />
        )}
      </g>

      {/* Silver inner facet edges ("inner pyramid") */}
      <g stroke="#c9c9d1" strokeWidth="0.6" fill="none" opacity="0.5">
        <line x1="38" y1="44" x2="50" y2="12" pathLength={1} className="vd-draw" style={delay(1.25)} />
        <line x1="62" y1="44" x2="50" y2="12" pathLength={1} className="vd-draw" style={delay(1.3)} />
        <line x1="38" y1="44" x2="50" y2="88" pathLength={1} className="vd-draw" style={delay(1.35)} />
        <line x1="62" y1="44" x2="50" y2="88" pathLength={1} className="vd-draw" style={delay(1.4)} />
      </g>

      {/* Gold outline and girdle along key construction points */}
      <g stroke={`url(#${goldId})`} strokeWidth="0.9" fill="none" strokeLinejoin="round">
        <polygon points="50,12 78,44 50,88 22,44" pathLength={1} className="vd-draw" style={delay(0.9)} />
        <line x1="22" y1="44" x2="78" y2="44" pathLength={1} className="vd-draw" style={delay(1.1)} />
      </g>
    </svg>
  );
}
