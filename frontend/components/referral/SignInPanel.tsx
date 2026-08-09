"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Check, Copy, Share2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ConnectWallet from "@/components/presale/ConnectWallet";
import { getChallenge, getMe, verifyChallenge, type Me } from "@/lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth";
import { shortenAddress } from "@/lib/lamports";

type Status = "idle" | "loading" | "signing" | "error" | "ready";

const PHASE_LABEL: Record<string, string> = {
  v0: "V0", v1: "V1", v2: "V2", v3: "V3", v4: "V4", v5: "V5",
};

export default function SignInPanel() {
  const { publicKey, signMessage } = useWallet();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [welcomeNew, setWelcomeNew] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadMe = useCallback(async (token: string) => {
    const data = await getMe(token);
    // A stored token belongs to whatever wallet last signed in - if a
    // different wallet is connected now, it's stale for this session.
    if (publicKey && data.wallet_address !== publicKey.toBase58()) {
      clearStoredToken();
      return null;
    }
    return data;
  }, [publicKey]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    setStatus("loading");
    loadMe(token)
      .then((data) => {
        if (data) {
          setMe(data);
          setStatus("ready");
        } else {
          setStatus("idle");
        }
      })
      .catch(() => {
        clearStoredToken();
        setStatus("idle");
      });
  }, [loadMe]);

  async function handleSignIn() {
    if (!publicKey || !signMessage) return;
    setStatus("signing");
    setError(null);
    try {
      const address = publicKey.toBase58();
      const challenge = await getChallenge(address);
      const signature = await signMessage(new TextEncoder().encode(challenge.message));
      const sigBase64 = btoa(String.fromCharCode(...signature));
      const result = await verifyChallenge(address, challenge.nonce, sigBase64, refCode ?? undefined);
      setStoredToken(result.token);
      setWelcomeNew(result.created);
      const data = await getMe(result.token);
      setMe(data);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Sign-in didn't go through. Try again.");
    }
  }

  function copyLink() {
    if (!me || typeof window === "undefined") return;
    const link = `${window.location.origin}/referral?ref=${me.referral_code}`;
    void navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (me && status === "ready") {
    const link = typeof window !== "undefined" ? `${window.location.origin}/referral?ref=${me.referral_code}` : "";
    return (
      <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
        {welcomeNew && (
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-vault-blue">
            <Sparkles size={14} /> Welcome to the referral program
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">Your Referral Link</h2>
          <span className="font-mono text-xs text-text-secondary">{shortenAddress(me.wallet_address)}</span>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 truncate rounded-lg border border-border-subtle bg-bg-void px-4 py-3 font-mono text-xs text-text-primary">
            {link}
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center justify-center gap-2 rounded-lg border border-vault-blue bg-vault-blue/10 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:bg-vault-blue/20"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Referrals</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-text-primary">{me.referred_count}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Earned</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-text-primary">{me.earned_vot} VOT</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Joined At</p>
            <p className="mt-1 font-mono text-2xl text-text-primary">{PHASE_LABEL[me.joined_phase] ?? me.joined_phase}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Earning Since</p>
            <p className="mt-1 font-mono text-2xl text-text-primary">{PHASE_LABEL[me.joined_phase] ?? me.joined_phase}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Milestone Rewards</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MilestoneRow
              label="100 referrals -> Limited Vaultor NFT"
              release="Released at V2"
              reached={me.milestone_100_reached_at}
              progress={me.referred_count}
              target={100}
            />
            <MilestoneRow
              label="500 referrals -> Super-limited Vaultor NFT"
              release="Released at V3"
              reached={me.milestone_500_reached_at}
              progress={me.referred_count}
              target={500}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="metal-ring rounded-xl border border-transparent bg-surface p-6 sm:p-8">
      {refCode && (
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-vault-blue">
          <Share2 size={14} /> You were referred with code {refCode}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">Sign In To Get Your Link</h2>
        <ConnectWallet />
      </div>
      <p className="mt-2 text-xs text-text-secondary">
        Connect your wallet and sign one message to confirm it&apos;s yours - free, no transaction, no gas.
      </p>

      {publicKey && !signMessage && (
        <p className="mt-4 text-xs text-text-secondary">
          This wallet doesn&apos;t support message signing. Try Phantom, Solflare, or Backpack.
        </p>
      )}

      {publicKey && signMessage && (
        <button
          type="button"
          onClick={handleSignIn}
          disabled={status === "signing" || status === "loading"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-vault-blue bg-vault-blue/10 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:bg-vault-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "signing" ? "Confirm in wallet..." : "Sign In"}
        </button>
      )}

      {error && <p className="mt-4 text-xs text-text-secondary">{error}</p>}
    </div>
  );
}

function MilestoneRow({
  label,
  release,
  reached,
  progress,
  target,
}: {
  label: string;
  release: string;
  reached: string | null;
  progress: number;
  target: number;
}) {
  const pct = Math.min(100, Math.round((progress / target) * 100));
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-void p-4">
      <p className="text-xs text-text-primary">{label}</p>
      <p className="mt-1 text-[11px] text-text-secondary">{release}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
        <div className="h-full rounded-full bg-vault-blue" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-text-secondary">
        {reached ? "Reached - awaiting release" : `${progress} / ${target}`}
      </p>
    </div>
  );
}
