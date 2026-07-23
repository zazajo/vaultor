import { Eye, TrendingUp, ShieldCheck, BrainCircuit } from "lucide-react";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import SectionDivider from "@/components/SectionDivider";
import HexBadge from "@/components/HexBadge";

export const metadata: Metadata = {
  title: "About | Vaultor",
  description: "The story and mission behind Vaultor.",
};

const PILLARS = [
  {
    icon: Eye,
    title: "Watch",
    description: "The Observer tracks markets around the clock, surfacing what matters before it moves.",
  },
  {
    icon: BrainCircuit,
    title: "Understand",
    description: "AI-driven signals turn raw market noise into readable, actionable intelligence.",
  },
  {
    icon: TrendingUp,
    title: "Predict",
    description: "Prediction markets let you trade on outcomes with transparent, on-chain settlement.",
  },
  {
    icon: ShieldCheck,
    title: "Protect",
    description: "Insurance pools stand between your capital and the volatility of the markets.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <PageHeader
          eyebrow="Our Story"
          title="Built by Observers, for Observers"
          description="Vaultor exists because markets move faster than any one person can watch. We built the system we wished we had — one that never sleeps, never blinks, and never stops learning."
        />
      </section>

      <section className="relative mx-auto max-w-4xl px-4 pb-20 sm:px-6 sm:pb-24">
        <FadeIn>
          <SectionDivider />
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-lg font-semibold uppercase leading-relaxed tracking-wide text-text-secondary sm:text-xl">
            Before the Vaults. Before the Systems.
            <br />
            <span className="text-vault-blue">Before the Protocols.</span>
            <br />
            There Was the First Observer.
          </p>
        </FadeIn>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <FadeIn className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-border-subtle bg-surface p-6 sm:p-8"
              >
                <HexBadge icon={pillar.icon} size={56} />
                <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-text-primary">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">{pillar.description}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>
    </>
  );
}
