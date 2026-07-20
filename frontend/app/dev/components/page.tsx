import { Shield, Lock, Users, Globe, Layers, TrendingUp, Fingerprint } from "lucide-react";
import HexBadge from "@/components/HexBadge";
import StatsBar from "@/components/StatsBar";
import FeatureCard from "@/components/FeatureCard";
import SectionDivider from "@/components/SectionDivider";
import OrbitalRing from "@/components/OrbitalRing";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-vault-blue">{title}</h2>
      {children}
    </section>
  );
}

export default function ComponentsDevPage() {
  return (
    <div className="min-h-screen bg-bg-void">
      <div className="mx-auto max-w-6xl px-6 pt-16">
        <p className="rounded-lg border border-border-subtle bg-surface px-4 py-3 text-sm text-text-secondary">
          Temporary internal review page — not linked from navigation, remove before launch.
        </p>
      </div>

      <Block title="HexBadge">
        <div className="flex flex-wrap items-center gap-8">
          <HexBadge icon={Shield} />
          <HexBadge icon={Lock} size={72} />
          <HexBadge icon={Fingerprint} size={40} />
        </div>
      </Block>

      <Block title="StatCell (standalone)">
        <div className="max-w-sm rounded-xl border border-border-subtle bg-surface">
          <div className="flex items-start gap-4 p-8">
            <HexBadge icon={TrendingUp} />
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Total Locked
              </span>
              <span className="font-mono text-2xl font-semibold tabular-nums text-text-primary sm:text-3xl">
                —
              </span>
              <span className="text-xs text-text-secondary">Live at presale launch</span>
            </div>
          </div>
        </div>
      </Block>

      <Block title="StatsBar">
        <StatsBar
          cells={[
            {
              key: "locked",
              props: {
                leading: <HexBadge icon={Shield} />,
                label: "Total Locked",
                value: "—",
                caption: "Live at presale launch",
              },
            },
            {
              key: "holders",
              props: {
                leading: <HexBadge icon={Users} />,
                label: "Holders",
                value: "—",
                caption: "Live at presale launch",
              },
            },
            {
              key: "countries",
              props: {
                leading: <HexBadge icon={Globe} />,
                label: "Countries",
                value: "—",
                caption: "Live at presale launch",
              },
            },
            { key: "version", props: { variant: "version", badgeText: "V0", versionLabel: "The Signal" } },
            {
              key: "layers",
              props: {
                leading: <HexBadge icon={Layers} />,
                label: "Phases",
                value: "6",
                caption: "V0 through V5",
              },
            },
            {
              key: "security",
              props: {
                leading: <HexBadge icon={Fingerprint} />,
                label: "Audits",
                value: "TBD",
                caption: "Pre-launch review",
              },
            },
          ]}
        />
      </Block>

      <Block title="FeatureCard">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Shield}
            title="Non-Custodial Vaults"
            description="Assets stay in contracts you control, never in a centralized custody wallet."
          />
          <FeatureCard
            icon={Users}
            title="Community Owned"
            description="Governance and allocation are structured around holders from day one."
          />
          <FeatureCard
            icon={Globe}
            title="Chain Agnostic"
            description="Built to expand across ecosystems as the roadmap phases unlock."
          />
        </div>
      </Block>

      <Block title="SectionDivider">
        <SectionDivider />
      </Block>

      <Block title="OrbitalRing">
        <div className="flex items-center justify-center py-8">
          <OrbitalRing size={360} />
        </div>
      </Block>
    </div>
  );
}
