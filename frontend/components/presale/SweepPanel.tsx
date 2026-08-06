"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AlertTriangle, ExternalLink, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ConnectWallet from "@/components/presale/ConnectWallet";
import WalletContext, { type SolanaCluster } from "@/components/presale/WalletContext";
import { formatSol, shortenAddress } from "@/lib/lamports";

// Same address shape used elsewhere on the site (AllocationChecker, the
// indexer's own view-layer validation) — base58, no ambiguous characters.
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const CLUSTERS = [
  { value: "mainnet-beta" as const, label: "Mainnet (real funds)" },
  { value: "devnet" as const, label: "Devnet (test)" },
];

// Not linked from anywhere on the site and excluded from search indexing
// (see the page's metadata) — but nothing about that is what makes this
// page safe to leave reachable. The only thing that can actually move
// money is the private key held in whatever wallet gets connected here.
// This page never talks to Vaultor's backend at all: no fetch, no API call,
// nothing to configure ahead of time. Every input — which wallet, how much,
// where to — is supplied live, at the moment of use, by whoever is signing.
export default function SweepPanel() {
  const [cluster, setCluster] = useState<SolanaCluster>("mainnet-beta");

  return (
    <div className="flex flex-col gap-6">
      <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-vault-blue" />
          <div className="text-xs leading-relaxed text-text-secondary">
            <p className="font-semibold text-text-primary">Internal tool — this moves real funds.</p>
            <p className="mt-1.5">
              This builds a transaction that sends the entire balance of whatever wallet you connect
              to an address you type in below, and asks that wallet to sign it. There is no undo once
              you approve it there.
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {CLUSTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCluster(option.value)}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                cluster === option.value
                  ? "border-vault-blue text-vault-blue"
                  : "border-border-subtle text-text-secondary hover:border-vault-blue/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remounted whenever cluster changes (key), rather than mutating the
          connection in place, so a stale connection to the wrong network
          can't linger after switching. */}
      <WalletContext cluster={cluster} key={cluster}>
        <SweepForm cluster={cluster} />
      </WalletContext>
    </div>
  );
}

type SweepStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; signature: string }
  | { kind: "error"; message: string };

function SweepForm({ cluster }: { cluster: SolanaCluster }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [balance, setBalance] = useState<bigint | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [destinationConfirm, setDestinationConfirm] = useState("");
  const [status, setStatus] = useState<SweepStatus>({ kind: "idle" });

  // Used for the post-sweep refresh, which fires from an event handler, not
  // an effect. The initial load below intentionally does not call this —
  // an effect calling a wrapped async setter is flagged as a cascading-render
  // risk, so it inlines the same promise chain directly instead (matching
  // AllocationChecker's lookup effect).
  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const lamports = await connection.getBalance(publicKey, "confirmed");
      setBalance(BigInt(lamports));
      setBalanceError(null);
    } catch {
      setBalance(null);
      setBalanceError("Couldn't read the wallet balance from the RPC endpoint. Try again.");
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (!publicKey) return;
    let cancelled = false;

    connection
      .getBalance(publicKey, "confirmed")
      .then((lamports) => {
        if (cancelled) return;
        setBalance(BigInt(lamports));
        setBalanceError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setBalance(null);
        setBalanceError("Couldn't read the wallet balance from the RPC endpoint. Try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [connection, publicKey]);

  const trimmedDestination = destination.trim();
  const destinationValid = BASE58.test(trimmedDestination);
  const destinationsMatch =
    trimmedDestination.length > 0 && trimmedDestination === destinationConfirm.trim();
  const destinationIsSelf = Boolean(publicKey) && trimmedDestination === publicKey?.toBase58();

  const canSweep =
    Boolean(publicKey) &&
    balance !== null &&
    balance > 0n &&
    destinationValid &&
    destinationsMatch &&
    !destinationIsSelf &&
    status.kind !== "sending";

  async function handleSweep() {
    if (!publicKey || balance === null) return;
    setStatus({ kind: "sending" });
    try {
      const destinationKey = new PublicKey(trimmedDestination);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      // Fee depends on the transaction's signatures, not the transfer amount,
      // so price it with a throwaway amount first, then send exactly
      // (balance - fee) — draining the wallet to zero rather than leaving
      // unswept dust or failing outright for lacking fee money.
      const probe = new Transaction();
      probe.recentBlockhash = blockhash;
      probe.feePayer = publicKey;
      probe.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: destinationKey, lamports: 0 }));

      const feeResult = await connection.getFeeForMessage(probe.compileMessage(), "confirmed");
      const fee = BigInt(feeResult.value ?? 5000);

      if (balance <= fee) {
        throw new Error(`Balance (${formatSol(balance, 9)} SOL) isn't enough to cover the network fee.`);
      }

      const lamportsToSend = balance - fee;
      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: destinationKey, lamports: lamportsToSend }));

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      setStatus({ kind: "sent", signature });
      await refreshBalance();
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error && error.message ? error.message : "The wallet did not complete the transfer.",
      });
    }
  }

  const explorerUrl = (signature: string) => {
    const base = `https://explorer.solana.com/tx/${signature}`;
    return cluster === "mainnet-beta" ? base : `${base}?cluster=${cluster}`;
  };

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
          1. Connect the wallet to sweep
        </h2>
        <ConnectWallet />
      </div>

      {publicKey && (
        <div className="mt-4 rounded-lg border border-border-subtle bg-bg-void p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            Connected wallet balance
          </p>
          <p className="mt-1 font-mono text-2xl tabular-nums text-text-primary">
            {balance !== null ? `${formatSol(balance, 9)} SOL` : balanceError ? "—" : "Loading…"}
          </p>
          <p className="mt-1 font-mono text-xs text-text-secondary">
            {shortenAddress(publicKey.toBase58(), 6, 6)}
          </p>
          {balanceError && <p className="mt-2 text-xs text-text-secondary">{balanceError}</p>}
        </div>
      )}

      {publicKey && (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-text-primary">
            2. Destination address
          </h2>
          <p className="mt-2 text-xs text-text-secondary">
            Type it twice. This is deliberately not pre-filled or remembered — verify it against your
            own records each time, not against what&apos;s already on this screen.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Destination Solana address"
              spellCheck={false}
              autoComplete="off"
              aria-label="Destination address"
              className="rounded-lg border border-border-subtle bg-bg-void px-4 py-3 font-mono text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/60 focus:border-vault-blue"
            />
            <input
              value={destinationConfirm}
              onChange={(event) => setDestinationConfirm(event.target.value)}
              placeholder="Type it again to confirm"
              spellCheck={false}
              autoComplete="off"
              aria-label="Confirm destination address"
              className="rounded-lg border border-border-subtle bg-bg-void px-4 py-3 font-mono text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/60 focus:border-vault-blue"
            />
          </div>
          {destination && !destinationValid && (
            <p className="mt-2 text-xs text-text-secondary">That doesn&apos;t look like a Solana address.</p>
          )}
          {destination && destinationValid && destinationConfirm && !destinationsMatch && (
            <p className="mt-2 text-xs text-text-secondary">The two addresses don&apos;t match.</p>
          )}
          {destinationIsSelf && (
            <p className="mt-2 text-xs text-text-secondary">
              That&apos;s the connected wallet itself — nothing to sweep.
            </p>
          )}

          <button
            type="button"
            onClick={handleSweep}
            disabled={!canSweep}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-vault-blue bg-vault-blue/10 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:bg-vault-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
            {status.kind === "sending"
              ? "Confirm in wallet…"
              : balance !== null
                ? `Sweep ${formatSol(balance, 9)} SOL (minus fee)`
                : "Sweep"}
          </button>
        </>
      )}

      {status.kind === "error" && <p className="mt-4 text-xs text-text-secondary">{status.message}</p>}
      {status.kind === "sent" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border-subtle bg-bg-void p-4 text-xs text-text-secondary">
          <span>Sent.</span>
          <a
            href={explorerUrl(status.signature)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-vault-blue hover:text-text-primary"
          >
            View transaction <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
