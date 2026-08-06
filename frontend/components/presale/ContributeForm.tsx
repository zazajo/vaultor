"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { ExternalLink, Send } from "lucide-react";
import { useState } from "react";
import ConnectWallet from "@/components/presale/ConnectWallet";
import type { SolanaCluster } from "@/components/presale/WalletContext";
import { formatSol, parseSolInput, toLamports } from "@/lib/lamports";

type SendStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; signature: string }
  | { kind: "error"; message: string };

function explorerUrl(signature: string, cluster: SolanaCluster) {
  const base = `https://explorer.solana.com/tx/${signature}`;
  return cluster === "mainnet-beta" ? base : `${base}?cluster=${cluster}`;
}

// Caps are enforced here as a courtesy, not a guarantee: nothing stops anyone
// from sending to the treasury address from outside this page entirely, so
// the indexer never relied on this check and doesn't need to.
export default function ContributeForm({
  treasuryAddress,
  cluster,
  minContributionLamports,
  maxContributionLamports,
  onSent,
}: {
  treasuryAddress: string;
  cluster: SolanaCluster;
  minContributionLamports: string;
  maxContributionLamports: string;
  onSent?: () => void;
}) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<SendStatus>({ kind: "idle" });

  const min = toLamports(minContributionLamports);
  const max = toLamports(maxContributionLamports);
  const parsed = amount ? parseSolInput(amount) : null;

  let validationError: string | null = null;
  if (amount && parsed === null) {
    validationError = "Enter a valid SOL amount.";
  } else if (parsed !== null && parsed <= 0n) {
    validationError = "Amount must be greater than zero.";
  } else if (parsed !== null && min > 0n && parsed < min) {
    validationError = `Minimum contribution is ${formatSol(min)} SOL.`;
  } else if (parsed !== null && max > 0n && parsed > max) {
    validationError = `Maximum per wallet is ${formatSol(max)} SOL.`;
  }

  async function handleSend() {
    if (!publicKey || parsed === null) return;
    setStatus({ kind: "sending" });
    try {
      const treasury = new PublicKey(treasuryAddress);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: treasury, lamports: parsed }));

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      setStatus({ kind: "sent", signature });
      setAmount("");
      onSent?.();
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "The wallet did not complete the transfer.",
      });
    }
  }

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">Contribute</h2>
        <ConnectWallet />
      </div>

      <p className="mt-2 text-xs text-text-secondary">
        Enter an amount and your wallet will ask you to approve the transfer. You confirm the amount
        and destination in your own wallet before anything is sent — this page only proposes it.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            aria-label="Amount in SOL"
            disabled={status.kind === "sending"}
            className="w-full rounded-lg border border-border-subtle bg-bg-void px-4 py-3 pr-14 font-mono text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/60 focus:border-vault-blue disabled:opacity-50"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            SOL
          </span>
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!publicKey || parsed === null || !!validationError || status.kind === "sending"}
          className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle px-5 py-3 text-sm font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:border-vault-blue hover:text-text-primary disabled:opacity-50"
        >
          <Send size={16} />
          {status.kind === "sending" ? "Confirm in wallet…" : "Send"}
        </button>
      </div>

      {!publicKey && (
        <p className="mt-3 text-xs text-text-secondary">Connect a wallet to contribute directly from this page.</p>
      )}
      {validationError && amount && <p className="mt-3 text-xs text-text-secondary">{validationError}</p>}
      {status.kind === "error" && <p className="mt-3 text-xs text-text-secondary">{status.message}</p>}
      {status.kind === "sent" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border-subtle bg-bg-void p-4 text-xs text-text-secondary">
          <span>Sent. It can take a few minutes to appear in your allocation below.</span>
          <a
            href={explorerUrl(status.signature, cluster)}
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
