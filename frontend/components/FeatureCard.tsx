import type { LucideIcon } from "lucide-react";
import HexBadge from "@/components/HexBadge";
import VaultorDiamond from "@/components/VaultorDiamond";

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="metal-ring relative rounded-xl border border-transparent bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_var(--vault-glow)] sm:p-8">
      <VaultorDiamond size={16} glow={0} withV={false} className="absolute right-4 top-4 opacity-40" />
      <HexBadge icon={icon} size={56} />
      <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </div>
  );
}
