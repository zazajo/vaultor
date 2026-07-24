import VaultorDiamond from "@/components/VaultorDiamond";

export default function SectionEyebrow({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <VaultorDiamond size={16} glow={0} withV={false} className="shrink-0 opacity-70" />
      <span className="font-mono text-sm text-vault-blue">{number}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-primary sm:text-sm">
        {title}
      </span>
      <span className="metal-line-fade-r h-px flex-1" />
    </div>
  );
}
