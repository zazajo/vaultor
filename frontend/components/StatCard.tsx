import type { ReactNode } from "react";

export interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  caption: string;
}

export default function StatCard({ icon, value, label, caption }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-bg-void p-6 sm:p-8">
      <div className="text-vault-blue">{icon}</div>
      <span className="font-mono text-3xl font-semibold tabular-nums lining-nums text-text-primary sm:text-4xl">
        {value}
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-vault-blue">
        {label}
      </span>
      <span className="text-sm text-text-secondary">{caption}</span>
    </div>
  );
}
