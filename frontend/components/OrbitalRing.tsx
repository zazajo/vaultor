const RINGS = [90, 140, 180];

const NODES = [
  { x: 268.9, y: 257.9 },
  { x: 131.1, y: 142.1 },
  { x: 337.9, y: 224.4 },
  { x: 110.0, y: 307.2 },
  { x: 152.1, y: 68.4 },
  { x: 261.6, y: 369.2 },
  { x: 290.0, y: 44.1 },
];

const LINKS: [number, number][] = [
  [0, 2],
  [1, 4],
  [3, 5],
  [2, 6],
];

function DiamondNode({ x, y }: { x: number; y: number }) {
  return (
    <rect
      x={x - 3.5}
      y={y - 3.5}
      width="7"
      height="7"
      transform={`rotate(45 ${x} ${y})`}
      fill="var(--vault-blue)"
      fillOpacity="0.4"
      stroke="var(--vault-blue)"
      strokeOpacity="0.6"
      strokeWidth="1"
    />
  );
}

export default function OrbitalRing({ size, className }: { size?: number; className?: string }) {
  const dimension = size ? `${size}px` : "100%";
  return (
    <svg
      viewBox="0 0 400 400"
      style={{ width: dimension, height: dimension }}
      className={`orbital-spin pointer-events-none ${className ?? ""}`}
      aria-hidden
    >
      {RINGS.map((r) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
      ))}
      {LINKS.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--vault-blue)"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
      ))}
      {NODES.map((n, i) => (
        <DiamondNode key={i} x={n.x} y={n.y} />
      ))}
    </svg>
  );
}
