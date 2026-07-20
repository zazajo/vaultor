import type { ReactNode } from "react";

type StatCellProps =
  | {
      variant?: "default";
      leading: ReactNode;
      label: string;
      value: string;
      caption: string;
    }
  | {
      variant: "version";
      badgeText: string;
      versionLabel: string;
    };

export default function StatCell(props: StatCellProps) {
  if (props.variant === "version") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 bg-surface p-6 text-center sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-vault-blue">
          <span className="font-mono text-lg font-semibold text-text-primary">{props.badgeText}</span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-vault-blue">
          {props.versionLabel}
        </span>
      </div>
    );
  }

  const { leading, label, value, caption } = props;
  return (
    <div className="flex items-start gap-4 bg-surface p-6 sm:p-8">
      {leading}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          {label}
        </span>
        <span className="font-mono text-2xl font-semibold tabular-nums lining-nums text-text-primary sm:text-3xl">
          {value}
        </span>
        <span className="text-xs text-text-secondary">{caption}</span>
      </div>
    </div>
  );
}
