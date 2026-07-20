import { TrendingUp, Eye, Umbrella, BrainCircuit, PieChart } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import SectionEyebrow from "@/components/SectionEyebrow";
import FeatureCard from "@/components/FeatureCard";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Prediction Markets",
    description: "Trade on real-world outcomes with transparent, on-chain settlement.",
  },
  {
    icon: Eye,
    title: "Live Monitored",
    description: "The Observer watches every position around the clock, always alert.",
  },
  {
    icon: Umbrella,
    title: "Insurance Protection",
    description: "Coverage pools that protect your capital when markets turn violent.",
  },
  {
    icon: BrainCircuit,
    title: "AI Intelligence Engine",
    description: "Machine-learned signals surface risk before it reaches your portfolio.",
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description: "Deep performance breakdowns across every vault you hold.",
  },
];

export default function Features() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <FadeIn>
        <SectionEyebrow number="02" title="What the Observer Sees" />
      </FadeIn>
      <FadeIn delay={0.1} className="mt-8 sm:mt-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
