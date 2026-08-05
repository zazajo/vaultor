"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { getAllocation, type Allocation } from "@/lib/api";
import { formatSol, formatTokens } from "@/lib/lamports";

// Base58 excludes 0, O, I and l to avoid visually ambiguous characters.
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export default function AllocationChecker() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<Allocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = address.trim();

    // Validated client-side first so an obvious typo doesn't read as "you have
    // contributed nothing", which would be alarming to someone who just sent funds.
    if (!BASE58.test(trimmed)) {
      setError("That doesn't look like a Solana address. Check it and try again.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setResult(await getAllocation(trimmed));
    } catch {
      setError("Couldn't reach the allocation service. Try again in a moment.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
        Check Your Allocation
      </h2>
      <p className="mt-2 text-xs text-text-secondary">
        Enter the wallet you contributed from. Read-only — this never asks you to connect a wallet
        or sign anything.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Your Solana wallet address"
          spellCheck={false}
          autoComplete="off"
          aria-label="Solana wallet address"
          className="flex-1 rounded-lg border border-border-subtle bg-bg-void px-4 py-3 font-mono text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/60 focus:border-vault-blue"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle px-5 py-3 text-sm font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:border-vault-blue hover:text-text-primary disabled:opacity-50"
        >
          <Search size={16} />
          {loading ? "Checking" : "Check"}
        </button>
      </form>

      {error && <p className="mt-4 text-xs text-text-secondary">{error}</p>}

      {result && !error && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-void p-5">
          {result.contribution_count === 0 ? (
            <p className="text-sm text-text-secondary">
              No contributions found for this address yet. Transfers are credited once they finalize
              on chain, which can take a few minutes.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  Contributed
                </p>
                <p className="mt-1 font-mono text-xl tabular-nums text-text-primary">
                  {formatSol(result.contributed_lamports)} SOL
                </p>
                <p className="mt-1 text-[11px] text-text-secondary">
                  across {result.contribution_count}{" "}
                  {result.contribution_count === 1 ? "transfer" : "transfers"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  Tier
                </p>
                <p className="mt-1 font-mono text-xl text-text-primary">
                  {result.tier?.name ?? "—"}
                </p>
                {result.bonus_bps > 0 && (
                  <p className="mt-1 text-[11px] text-vault-blue">
                    +{(result.bonus_bps / 100).toFixed(result.bonus_bps % 100 === 0 ? 0 : 2)}% bonus
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  Allocation
                </p>
                <p className="mt-1 font-mono text-xl tabular-nums text-text-primary">
                  {formatTokens(result.total_tokens)}
                </p>
                <p className="mt-1 text-[11px] text-text-secondary">
                  {result.total_tokens === null ? "Pricing not yet published" : "tokens"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
