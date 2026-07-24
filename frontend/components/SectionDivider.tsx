import VaultorDiamond from "@/components/VaultorDiamond";

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
      <VaultorDiamond size={32} glow={0.3} variant="constructing" className="shrink-0" />
      <CircuitNode />
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
