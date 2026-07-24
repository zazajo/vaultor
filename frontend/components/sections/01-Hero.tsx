import {
  Play,
  ArrowRight,
  Globe,
  Monitor,
  Smartphone,
  Activity,
  Bell,
  ShieldCheck,
  Target,
  BadgeCheck,
  Gift,
  Network,
} from "lucide-react";
import FadeIn from "@/components/FadeIn";
import Countdown from "@/components/Countdown";
import HexBadge from "@/components/HexBadge";
import OceanHorizon from "@/components/OceanHorizon";
import VaultorDiamond from "@/components/VaultorDiamond";

/* Distant hooded figure at the horizon: a suggestion, not a subject.
   Hidden on small screens where the stacked layout would put it over text. */
function DistantObserver() {
  return (
    <svg
      viewBox="0 0 40 60"
      width={34}
      height={51}
      aria-hidden
      className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 lg:block"
      style={{ top: "62%", transform: "translate(-50%, -96%)", opacity: 0.45 }}
    >
      <defs>
        <linearGradient id="distant-observer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141b2e" />
          <stop offset="70%" stopColor="#0a0e1a" />
          <stop offset="100%" stopColor="#05070d" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M20 5 C14.5 5 11 9.5 11 15 C11 17.8 11.9 19.9 13 21.5 C9.5 29 7 41 6 57 L34 57 C33 41 30.5 29 27 21.5 C28.1 19.9 29 17.8 29 15 C29 9.5 25.5 5 20 5 Z"
        fill="url(#distant-observer)"
      />
    </svg>
  );
}

const MINI_FEATURES = [
  {
    icon: Activity,
    title: "Real-Time Data",
    caption: "24/7 monitoring across every chain we track.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    caption: "Get notified the instant markets move.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    caption: "Non-custodial, audited infrastructure.",
  },
];

const FEATURE_ROW = [
  { icon: Target, label: "Prediction" },
  { icon: BadgeCheck, label: "Reputation" },
  { icon: Gift, label: "Rewards" },
  { icon: Network, label: "Collective Intelligence" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
      <OceanHorizon intensity="medium" />
      <DistantObserver />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:gap-12">
        <div className="flex flex-col items-start text-left">
          <FadeIn delay={0}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-vault-blue" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-vault-blue sm:text-sm">
                Vaultor Genesis // V0
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="hero-headline mt-5 font-extrabold uppercase tracking-tighter sm:mt-6">
              <span className="block text-gradient-silver">Perception</span>
              <span className="block text-gradient-silver">Precedes</span>
              <span className="block text-gradient-blue-chrome">Prediction.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-5 max-w-[52ch] text-base text-text-secondary sm:mt-6 sm:text-lg">
              A perception-first prediction ecosystem where intelligence
              compounds, reputation matters, and every insight strengthens the
              network.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <a
                href="#enter"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-vault-blue px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_40px_var(--vault-glow)] transition-shadow duration-300 hover:shadow-[0_0_60px_var(--vault-glow)] sm:w-auto"
              >
                Enter Genesis
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-full border border-border-subtle bg-transparent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-text-primary transition-colors duration-300 hover:border-text-secondary sm:w-auto"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-vault-blue text-vault-blue">
                  <Play size={11} fill="currentColor" />
                </span>
                Watch Intro
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
              {FEATURE_ROW.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2">
                  <feature.icon size={16} className="shrink-0 text-vault-blue" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary sm:text-xs">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-8 sm:mt-10">
              <Countdown />
            </div>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Available On
              </span>
              <div className="flex items-center gap-4 text-text-secondary">
                <Globe size={18} />
                <Monitor size={18} />
                <Smartphone size={18} />
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="flex justify-center">
          <div className="relative flex aspect-square w-full max-w-[420px] items-center justify-center lg:-translate-y-10">
            <div className="orb-gradient orb-breathe absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
            <VaultorDiamond size={210} glow={0.75} variant="constructing" className="relative" />
          </div>
        </FadeIn>

        <div className="hidden items-stretch xl:flex">
          <span className="mr-10 w-px shrink-0 bg-border-subtle" />
          <FadeIn delay={0.3} className="flex flex-col justify-center gap-8">
            {MINI_FEATURES.map((feature) => (
              <div key={feature.title} className="flex w-56 items-start gap-4">
                <HexBadge icon={feature.icon} size={40} />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-text-primary">
                    {feature.title}
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary">{feature.caption}</p>
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
