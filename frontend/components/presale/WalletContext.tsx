"use client";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo, type ReactNode } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

// Deliberately no ConnectionProvider. Nothing here reads chain state from the
// browser — the connected address is only used to query our own API — so the
// page never needs an RPC endpoint and no RPC key is shipped to the client.
//
// The wallets array is empty on purpose: Phantom, Solflare, Backpack and the
// rest register themselves through the Wallet Standard, so listing adapters
// explicitly would pull in a large bundle to detect wallets that announce
// themselves anyway.
export default function WalletContext({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [], []);

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
}
