import { ArrowRight } from "lucide-react";

// Prices are formatted from the raw decimal strings rather than parsed as
// floats — $0.008 is exactly the kind of value that picks up representation
// error, and this is the headline number on the page.
function formatUsd(value: string): string {
  const trimmed = value.replace(/0+$/, "").replace(/\.$/, "");
  return `$${trimmed.includes(".") ? trimmed : `${trimmed}.00`}`;
}

function upliftPercent(presale: string, launch: string): number | null {
  const p = Number(presale);
  const l = Number(launch);
  if (!Number.isFinite(p) || !Number.isFinite(l) || p <= 0) return null;
  return Math.round((l / p - 1) * 1000) / 10;
}

export default function PriceBanner({
  presalePrice,
  launchPrice,
}: {
  presalePrice: string | null;
  launchPrice: string | null;
}) {
  if (!presalePrice || !launchPrice) return null;

  const uplift = upliftPercent(presalePrice, launchPrice);

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            Presale Price
          </p>
          <p className="mt-1.5 font-mono text-2xl tabular-nums text-text-primary sm:text-3xl">
            {formatUsd(presalePrice)}
          </p>
        </div>

        <ArrowRight size={18} className="shrink-0 text-vault-blue" aria-hidden="true" />

        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            Launch Price
          </p>
          <p className="mt-1.5 font-mono text-2xl tabular-nums text-text-primary sm:text-3xl">
            {formatUsd(launchPrice)}
          </p>
        </div>

        {uplift !== null && uplift > 0 && (
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              Difference
            </p>
            <p className="mt-1.5 font-mono text-2xl tabular-nums text-vault-blue sm:text-3xl">
              +{uplift % 1 === 0 ? uplift.toFixed(0) : uplift.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-[11px] leading-relaxed text-text-secondary">
        Contributions are made in SOL. The launch price is the intended listing price and is not a
        guarantee of value — the token has no price until it trades.
      </p>
    </div>
  );
}
