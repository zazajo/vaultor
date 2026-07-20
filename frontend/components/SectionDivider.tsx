const HEX_POINTS = "16,1.5 29.4,9 29.4,23 16,30.5 2.6,23 2.6,9";

function CircuitNode() {
  return (
    <svg viewBox="0 0 10 10" width={8} height={8} className="mx-3 shrink-0">
      <rect
        x="1.5"
        y="1.5"
        width="7"
        height="7"
        transform="rotate(45 5 5)"
        fill="var(--vault-blue)"
        fillOpacity="0.25"
        stroke="var(--vault-blue)"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function SectionDivider() {
  return (
    <div className="mx-auto flex max-w-md items-center" aria-hidden>
      <span className="h-px flex-1 bg-border-subtle" />
      <CircuitNode />
      <svg viewBox="0 0 32 32" width={32} height={32} className="shrink-0">
        <polygon
          points={HEX_POINTS}
          fill="var(--vault-blue)"
          fillOpacity="0.08"
          stroke="var(--border-subtle)"
          strokeWidth="1.25"
        />
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="monospace"
          fill="var(--vault-blue)"
        >
          V
        </text>
      </svg>
      <CircuitNode />
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
