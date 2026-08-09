"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, type ReactNode } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

export type SolanaCluster = "mainnet-beta" | "devnet";

// The wallets array is empty on purpose: Phantom, Solflare, Backpack and the
// rest register themselves through the Wallet Standard, so listing adapters
// explicitly would pull in a large bundle to detect wallets that announce
// themselves anyway.
//
// Mainnet uses a dedicated RPC (NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL) rather
// than Solana's public cluster endpoint: the public one is shared across
// everyone hitting it from the same network and can already be over its free
// quota before this page makes a single call, which is not acceptable for
// the tool that sweeps the presale treasury. This key is a client-exposed
// free-tier key, not the paid one the backend indexer uses, and is meant to
// be public. Devnet has no such contention, so it keeps the public endpoint.
export default function WalletContext({
  children,
  cluster,
}: {
  children: ReactNode;
  cluster: SolanaCluster;
}) {
  const wallets = useMemo(() => [], []);
  const endpoint = useMemo(() => {
    if (cluster === "mainnet-beta" && process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL;
    }
    return clusterApiUrl(cluster);
  }, [cluster]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
