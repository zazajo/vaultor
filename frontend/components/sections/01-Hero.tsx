import { Play, Globe, Monitor, Smartphone, Activity, Bell, ShieldCheck } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import CosmicBackground from "@/components/CosmicBackground";
import Countdown from "@/components/Countdown";
import ObserverArt from "@/components/ObserverArt";
import HexBadge from "@/components/HexBadge";

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

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
      <CosmicBackground />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:gap-12">
        <div className="flex flex-col items-start text-left">
          <FadeIn delay={0}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-vault-blue" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-vault-blue sm:text-sm">
                The Observer Protocol
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="hero-headline mt-5 font-extrabold uppercase tracking-tighter sm:mt-6">
              <span className="block text-gradient-silver">Observe.</span>
              <span className="block text-gradient-silver">Understand.</span>
              <span className="block text-gradient-blue-chrome">Predict.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-5 max-w-[48ch] text-base text-text-secondary sm:mt-6 sm:text-lg">
              Real-time market intelligence and predictive signals, watching the
              chain so you don&apos;t have to.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <a
                href="#enter"
                className="w-full rounded-full bg-vault-blue px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_40px_var(--vault-glow)] transition-shadow duration-300 hover:shadow-[0_0_60px_var(--vault-glow)] sm:w-auto"
              >
                Enter the Vault »
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
            <div className="mt-8 sm:mt-10">
              <Countdown />
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
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
          <ObserverArt />
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
