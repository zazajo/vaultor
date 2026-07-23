import { Radar, LineChart, Target, ShieldCheck } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import SectionEyebrow from "@/components/SectionEyebrow";
import StatsBar from "@/components/StatsBar";
import HexBadge from "@/components/HexBadge";

export default function Stats() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <FadeIn>
        <SectionEyebrow number="01" title="The Vault at a Glance" />
      </FadeIn>
      <FadeIn delay={0.1} className="mt-8 sm:mt-10">
        <StatsBar
          cells={[
            {
              key: "signals",
              props: {
                leading: <HexBadge icon={Radar} />,
                label: "Signals Processed",
                value: "—",
                caption: "Live at launch",
              },
            },
            {
              key: "markets",
              props: {
                leading: <HexBadge icon={LineChart} />,
                label: "Markets Monitored",
                value: "—",
                caption: "Live at launch",
              },
            },
            { key: "version", props: { variant: "version", badgeText: "V0", versionLabel: "Genesis" } },
            {
              key: "accuracy",
              props: {
                leading: <HexBadge icon={Target} />,
                label: "Prediction Accuracy",
                value: "—",
                caption: "Live at launch",
              },
            },
            {
              key: "protected",
              props: {
                leading: <HexBadge icon={ShieldCheck} />,
                label: "Users Protected",
                value: "—",
                caption: "Live at launch",
              },
            },
          ]}
        />
      </FadeIn>
    </section>
  );
}
