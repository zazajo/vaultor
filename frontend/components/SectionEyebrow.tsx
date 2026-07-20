export default function SectionEyebrow({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-sm text-vault-blue">{number}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-primary sm:text-sm">
        {title}
      </span>
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
