import { CheckCircle2, Zap, Target, ShieldCheck, Radar } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import PhoneMockup from "@/components/PhoneMockup";
import HexBadge from "@/components/HexBadge";

const MINI_FEATURES = [
  "Live prediction markets across every asset class",
  "AI-driven confidence scoring on every position",
  "Real-time alerts the moment markets move",
];

const ADVANTAGES = [
  {
    icon: Zap,
    title: "Instant Execution",
    caption: "Trade signals resolve in milliseconds.",
  },
  {
    icon: Target,
    title: "Precision Signals",
    caption: "AI-scored confidence on every market.",
  },
  {
    icon: ShieldCheck,
    title: "Audited & Secure",
    caption: "Non-custodial contracts, fully verified.",
  },
  {
    icon: Radar,
    title: "24/7 Coverage",
    caption: "The Observer never sleeps.",
  },
];

export default function App() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col items-start text-left">
          <FadeIn delay={0}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-vault-blue" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-vault-blue sm:text-sm">
                Built for Intelligence
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="hero-headline mt-5 text-[clamp(2rem,4vw+1rem,3.5rem)] font-extrabold uppercase tracking-tighter">
              <span className="block text-gradient-silver">Predict.</span>
              <span className="block text-gradient-silver">Trade.</span>
              <span className="block text-gradient-blue-chrome">Watch Live.</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <ul className="mt-6 flex flex-col gap-3">
              {MINI_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-vault-blue" />
                  {feature}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.3}>
            <a
              href="#app"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-border-subtle bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-text-primary transition-colors duration-300 hover:border-text-secondary"
            >
              Explore the App
            </a>
          </FadeIn>
        </div>

        <FadeIn delay={0.2}>
          <PhoneMockup />
        </FadeIn>

        <div className="hidden lg:block">
          <FadeIn delay={0.3}>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-vault-blue">
              The Vaultor Advantage
            </span>
            <div className="mt-6 flex flex-col gap-6">
              {ADVANTAGES.map((advantage) => (
                <div key={advantage.title} className="flex items-start gap-4">
                  <HexBadge icon={advantage.icon} size={48} />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-text-primary">
                      {advantage.title}
                    </h4>
                    <p className="mt-1 text-xs text-text-secondary">{advantage.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
