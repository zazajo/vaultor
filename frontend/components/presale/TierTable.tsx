import type { Tier } from "@/lib/api";
import { formatSol } from "@/lib/lamports";

export default function TierTable({ tiers }: { tiers: Tier[] }) {
  if (tiers.length === 0) return null;

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
        Contribution Tiers
      </h2>
      <p className="mt-2 text-xs text-text-secondary">
        Tiers apply to your cumulative contribution, not to individual transfers.
      </p>

      {/* Table scrolls independently so the page body never scrolls sideways. */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Tier
              </th>
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Minimum
              </th>
              <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Bonus
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {tiers.map((tier) => (
              <tr key={tier.id}>
                <td className="py-4 pr-4">
                  <span className="text-sm font-semibold text-text-primary">{tier.name}</span>
                  {tier.description && (
                    <p className="mt-1 max-w-md text-xs text-text-secondary">{tier.description}</p>
                  )}
                </td>
                <td className="py-4 pr-4 font-mono text-sm tabular-nums text-text-secondary">
                  {formatSol(tier.min_lamports)} SOL
                </td>
                <td className="py-4 text-right font-mono text-sm tabular-nums text-vault-blue">
                  {tier.bonus_bps > 0 ? `+${(tier.bonus_bps / 100).toFixed(tier.bonus_bps % 100 === 0 ? 0 : 2)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
