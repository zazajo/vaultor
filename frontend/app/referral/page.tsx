import { Share2, Gift, Users, Clock } from "lucide-react";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import HexBadge from "@/components/HexBadge";

export const metadata: Metadata = {
  title: "Referral | Vaultor",
  description: "The Vaultor referral program, launching with The Foundation.",
};

const STEPS = [
  {
    icon: Share2,
    title: "Share Your Link",
    description: "Every Vaultor account will get a unique referral link to share with your network.",
  },
  {
    icon: Users,
    title: "Bring the Vault Together",
    description: "Friends who join through your link strengthen the Vaultor community from day one.",
  },
  {
    icon: Gift,
    title: "Earn Rewards",
    description: "Referrers are rewarded as the presale and early ecosystem come online.",
  },
];

export default function ReferralPage() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      <PageHeader
        eyebrow="Referral Program"
        title="Bring Others Into the Vault"
        description="The referral program is part of The Foundation — V0 — alongside the presale and the first Vaultor community. It isn't live yet, but here's what to expect."
      />

      <FadeIn delay={0.2} className="mt-10 flex justify-center">
        <span className="flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <Clock size={14} />
          Coming Soon — The Foundation (V0)
        </span>
      </FadeIn>

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
    </section>
  );
}
