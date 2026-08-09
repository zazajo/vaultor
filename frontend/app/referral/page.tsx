import { Gift, Share2, Users } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import HexBadge from "@/components/HexBadge";
import SignInPanel from "@/components/referral/SignInPanel";
import WalletContext from "@/components/presale/WalletContext";

export const metadata: Metadata = {
  title: "Referral | Vaultor",
  description: "Help grow Vaultor. Earn as we grow — 0.0001 VOT per referral, plus milestone rewards.",
};

const STEPS = [
  {
    icon: Share2,
    title: "Share Your Link",
    description: "Sign in with your wallet to get a unique referral link to share with your network.",
  },
  {
    icon: Users,
    title: "Bring the Vault Together",
    description: "Everyone who joins through your link grows the Vaultor community from day one.",
  },
  {
    icon: Gift,
    title: "Earn As We Grow",
    description: "0.0001 VOT per referral, tracked from the stage you join onward — plus milestone NFTs at 100 and 500 referrals.",
  },
];

export default function ReferralPage() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      <PageHeader
        eyebrow="Referral Program"
        title="Help Grow Vaultor. Earn As We Grow."
        description="The community attribution starts now. Perception precedes prediction — start referring, start earning."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <FadeIn key={step.title} delay={0.1 + i * 0.1}>
            <div className="h-full rounded-xl border border-border-subtle bg-surface p-6 sm:p-8">
              <HexBadge icon={step.icon} size={56} />
              <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.4} className="mt-10">
        {/* WalletContext only needs to be mounted for the adapter registry
            here - signing a message never touches useConnection()/RPC, so
            the cluster prop is unused in this flow. */}
        <WalletContext cluster="mainnet-beta">
          <Suspense fallback={null}>
            <SignInPanel />
          </Suspense>
        </WalletContext>
      </FadeIn>
    </section>
  );
}
