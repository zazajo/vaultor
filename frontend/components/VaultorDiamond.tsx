"use client";

import { useEffect, useId, useRef, useState } from "react";

const SEED_R = 10;
// 6 circle centers at 60-degree intervals around (50,50), radius SEED_R.
const SEED_CENTERS = [
  [60, 50],
  [55, 58.66],
  [45, 58.66],
  [40, 50],
  [45, 41.34],
  [55, 41.34],
] as const;

// Diamond frame vertices (outer / inner edge of the beveled band).
const OUTER = "50,5 89,50 50,95 11,50";
const INNER = "50,12.5 81.5,50 50,87.5 18.5,50";

const VERTEX_FLARES: ReadonlyArray<readonly [number, number]> = [
  [50, 5],
  [89, 50],
  [50, 95],
  [11, 50],
];

// Three descending "think, decide, execute" pearls below the core.
const AXIS_PEARLS = [
  { cy: 70, r: 1.1 },
  { cy: 74.5, r: 0.95 },
  { cy: 79, r: 0.8 },
];

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
  /** true: chevron V core (brand mark). false: inner-pyramid core (sigil form) */
  withV?: boolean;
  /** "constructing" draws the geometry in sequence once when scrolled into view */
  variant?: "static" | "constructing";
  className?: string;
}) {
  const id = useId();
  const coreId = `${id}-core`;
  const frameId = `${id}-frame`;
  const chevronId = `${id}-chevron`;
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
        <radialGradient id={coreId} cx="50%" cy="52%" r="50%">
          <stop offset="0%" stopColor="var(--vault-blue)" stopOpacity={0.75 * glow} />
          <stop offset="55%" stopColor="var(--vault-blue)" stopOpacity={0.22 * glow} />
          <stop offset="100%" stopColor="var(--vault-blue)" stopOpacity="0" />
        </radialGradient>
        {/* Icy chrome band, lit from the top like the reference frame */}
        <linearGradient id={frameId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef3fc" />
          <stop offset="38%" stopColor="#aebfe3" />
          <stop offset="72%" stopColor="#5c77b8" />
          <stop offset="100%" stopColor="#2e4a8f" />
        </linearGradient>
        <linearGradient id={chevronId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9c6ff" />
          <stop offset="55%" stopColor="#2563ff" />
          <stop offset="100%" stopColor="#142e6b" />
        </linearGradient>
        <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8d5a3" />
          <stop offset="50%" stopColor="#c9a86a" />
          <stop offset="100%" stopColor="#8a6f3d" />
        </linearGradient>
      </defs>

      {/* Seed-of-Life foundation + circles of intent, faint gold */}
      <g stroke={`url(#${goldId})`} strokeWidth="0.45" fill="none" opacity="0.3">
        <circle cx="50" cy="50" r={SEED_R} pathLength={1} className="vd-draw" style={delay(0)} />
        {SEED_CENTERS.map(([cx, cy], i) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={SEED_R}
            pathLength={1}
            className="vd-draw"
            style={delay(0.05 * (i + 1))}
          />
        ))}
        <circle cx="50" cy="50" r="30" opacity="0.55" pathLength={1} className="vd-draw" style={delay(0.35)} />
        <circle
          cx="50"
          cy="50"
          r="20"
          strokeDasharray="0.5 2"
          opacity="0.8"
          pathLength={1}
          className="vd-draw"
          style={delay(0.45)}
        />
      </g>

      {/* Vesica Piscis emphasis pulse, only during the constructing sequence */}
      {constructing && (
        <g stroke={`url(#${goldId})`} strokeWidth="0.7" fill="none" opacity="0" className="vd-vesica" style={delay(0.5)}>
          <circle cx="43" cy="50" r={SEED_R} />
          <circle cx="57" cy="50" r={SEED_R} />
        </g>
      )}

      {/* Diamond frame: edge strokes draw first, chrome band fills after */}
      <polygon
        points={OUTER}
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="0.5"
        strokeLinejoin="round"
        pathLength={1}
        className="vd-draw"
        style={delay(0.85)}
      />
      <polygon
        points={INNER}
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="0.5"
        strokeLinejoin="round"
        pathLength={1}
        className="vd-draw"
        style={delay(0.95)}
      />
      <g className="vd-fill" style={delay(1.15)}>
        <path
          d={`M${OUTER.split(" ").join(" L")} Z M${INNER.split(" ").join(" L")} Z`}
          fill={`url(#${frameId})`}
          fillRule="evenodd"
          opacity="0.92"
        />
      </g>

      {/* Axis mundi and its points */}
      <line
        x1="50"
        y1="1"
        x2="50"
        y2="99"
        stroke="#c9c9d1"
        strokeWidth="0.35"
        opacity="0.3"
        pathLength={1}
        className="vd-draw"
        style={delay(1.25)}
      />
      <g className="vd-fill" fill="#cdd8f0" style={delay(1.35)}>
        <circle cx="50" cy="2.5" r="0.9" opacity="0.7" />
        <circle cx="50" cy="97.5" r="0.9" opacity="0.7" />
        {AXIS_PEARLS.map((pearl) => (
          <circle key={pearl.cy} cx="50" cy={pearl.cy} r={pearl.r} opacity="0.85" />
        ))}
      </g>

      {/* Core: glow, crescent + dot near the top, chevron V or inner pyramid */}
      <g className="vd-fill" style={delay(1.6)}>
        <circle cx="50" cy="52" r="24" fill={`url(#${coreId})`} />

        <circle cx="50" cy="19.5" r="1.2" fill="#c9c9d1" opacity="0.85" />
        <path
          d="M44.6 20 A5.5 5.5 0 0 0 55.4 20 A7 7 0 0 1 44.6 20 Z"
          fill="#c9c9d1"
          opacity="0.7"
        />

        {withV ? (
          <path
            d="M38 42 L50 66 L62 42 L57 42 L50 55.5 L43 42 Z"
            fill={`url(#${chevronId})`}
            stroke="#c9c9d1"
            strokeWidth="0.5"
            strokeLinejoin="round"
            opacity="0.95"
          />
        ) : (
          <g>
            <polygon
              points="50,40 58,51 50,64 42,51"
              fill={`url(#${chevronId})`}
              stroke="#c9c9d1"
              strokeWidth="0.5"
              strokeLinejoin="round"
              opacity="0.95"
            />
            <g stroke="#c9c9d1" strokeWidth="0.35" opacity="0.6">
              <line x1="42" y1="51" x2="58" y2="51" />
              <line x1="50" y1="40" x2="50" y2="64" />
            </g>
          </g>
        )}

        {/* Star flares at the frame vertices */}
        <g fill="#cfe0ff" opacity="0.9">
          {VERTEX_FLARES.map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              d={`M${x} ${y - 3.2} L${x + 0.9} ${y - 0.9} L${x + 3.2} ${y} L${x + 0.9} ${y + 0.9} L${x} ${y + 3.2} L${x - 0.9} ${y + 0.9} L${x - 3.2} ${y} L${x - 0.9} ${y - 0.9} Z`}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
