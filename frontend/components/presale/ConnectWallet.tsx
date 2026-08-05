"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LogOut, Wallet } from "lucide-react";
import { shortenAddress } from "@/lib/lamports";

// Custom button rather than WalletMultiButton so it inherits the site's
// styling instead of the adapter's default theme.
export default function ConnectWallet() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-border-subtle bg-bg-void px-3 py-2 font-mono text-xs text-text-primary">
          {shortenAddress(publicKey.toBase58())}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          aria-label="Disconnect wallet"
          className="flex items-center justify-center rounded-lg border border-border-subtle p-2 text-text-secondary transition-colors hover:border-vault-blue hover:text-text-primary"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      disabled={connecting}
      className="flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:border-vault-blue hover:text-text-primary disabled:opacity-50"
    >
      <Wallet size={14} />
      {connecting ? "Connecting" : "Connect Wallet"}
    </button>
  );
}
