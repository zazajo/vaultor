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
// The connection uses Solana's public cluster endpoint, not the paid RPC the
// backend indexer uses — signing and broadcasting a transaction needs *some*
// endpoint, but not our metered one, so that key still never reaches the
// browser. Rate limits on the public endpoint are a non-issue here: this is a
// handful of user-initiated calls per session, not continuous polling.
export default function WalletContext({
  children,
  cluster,
}: {
  children: ReactNode;
  cluster: SolanaCluster;
}) {
  const wallets = useMemo(() => [], []);
  const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
