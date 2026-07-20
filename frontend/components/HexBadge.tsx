import type { LucideIcon } from "lucide-react";

const HEX_POINTS = "50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27";

export default function HexBadge({
  icon: Icon,
  size = 56,
  className,
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0">
        <defs>
          <radialGradient id="hexbadge-glow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="var(--vault-blue)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--vault-blue)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon points={HEX_POINTS} fill="url(#hexbadge-glow)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={size * 0.4} color="var(--vault-blue)" strokeWidth={1.75} />
      </div>
    </div>
  );
}
