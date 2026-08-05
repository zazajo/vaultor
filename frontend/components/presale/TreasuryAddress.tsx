"use client";

import { AlertTriangle, Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

// The single most impersonated element on the site. Contributors are shown the
// full address rather than a truncated one so they can verify every character
// against what they paste into their wallet — a middle-truncated address is
// exactly what address-poisoning attacks rely on going unnoticed.

const COPY_FEEDBACK_MS = 2000;

export default function TreasuryAddress({ address, cluster }: { address: string; cluster: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; the address stays selectable by hand.
    }
  }

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
          Contribution Address
        </h2>
        <span className="rounded-full border border-border-subtle px-3 py-1 text-[10px] uppercase tracking-wide text-text-secondary">
          Solana · {cluster}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <code className="flex-1 break-all rounded-lg border border-border-subtle bg-bg-void px-4 py-3 font-mono text-sm text-text-primary">
          {address}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle px-4 py-3 text-sm font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:border-vault-blue hover:text-text-primary sm:w-36"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-border-subtle bg-bg-void/60 p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-vault-blue" />
        <div className="text-xs leading-relaxed text-text-secondary">
          <p className="font-semibold text-text-primary">Verify this address before you send.</p>
          <p className="mt-1.5">
            This page is the only place Vaultor publishes the contribution address. We will never
            DM you an address, post one in chat, or ask you to send funds anywhere else. Anyone who
            does is impersonating us. Compare every character against your wallet before confirming
            — scammers use addresses that match at the start and end.
          </p>
        </div>
      </div>
    </div>
  );
}
