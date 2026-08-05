import { formatSol, percentOf, toLamports } from "@/lib/lamports";
import type { PresaleStatus } from "@/lib/api";

// Local to this panel rather than the shared StatCell, which carries its own
// bg-surface and would nest a second surface inside the card.
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
        {label}
      </span>
      <span className="font-mono text-lg tabular-nums text-text-primary">{value}</span>
    </div>
  );
}

export default function RaiseProgress({ status }: { status: PresaleStatus }) {
  const raised = toLamports(status.raised_lamports);
  const hardCap = toLamports(status.hard_cap_lamports);
  const softCap = toLamports(status.soft_cap_lamports);

  const progress = percentOf(raised, hardCap);
  const softCapMark = percentOf(softCap, hardCap);
  const softCapMet = softCap > 0n && raised >= softCap;

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">Raised</p>
          <p className="mt-1 font-mono text-3xl tabular-nums text-text-primary sm:text-4xl">
            {formatSol(raised)} <span className="text-lg text-text-secondary">SOL</span>
          </p>
        </div>
        {hardCap > 0n && (
          <p className="font-mono text-sm text-text-secondary">
            of {formatSol(hardCap)} SOL target
          </p>
        )}
      </div>

      {hardCap > 0n && (
        <div className="mt-6">
          <div className="relative h-2 overflow-hidden rounded-full bg-bg-void">
            <div
              className="h-full rounded-full bg-vault-blue transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
            {/* Soft cap marker, only meaningful when it sits inside the bar. */}
            {softCap > 0n && softCapMark > 0 && softCapMark < 100 && (
              <div
                className="absolute inset-y-0 w-px bg-text-secondary/60"
                style={{ left: `${softCapMark}%` }}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-text-secondary">
            <span>{progress.toFixed(1)}%</span>
            {softCap > 0n && (
              <span className={softCapMet ? "text-vault-blue" : undefined}>
                Soft cap {formatSol(softCap)} SOL {softCapMet ? "· met" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Contributors" value={status.contributor_count.toLocaleString("en-US")} />
        <Stat
          label="Min Contribution"
          value={
            toLamports(status.min_contribution_lamports) > 0n
              ? `${formatSol(status.min_contribution_lamports)} SOL`
              : "None"
          }
        />
        <Stat
          label="Max Per Wallet"
          value={
            toLamports(status.max_contribution_lamports) > 0n
              ? `${formatSol(status.max_contribution_lamports)} SOL`
              : "No cap"
          }
        />
      </div>
    </div>
  );
}
