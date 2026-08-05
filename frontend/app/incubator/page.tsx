import { Lock } from "lucide-react";
import type { Metadata } from "next";
import Countdown from "@/components/Countdown";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import AllocationChecker from "@/components/presale/AllocationChecker";
import RaiseProgress from "@/components/presale/RaiseProgress";
import TierTable from "@/components/presale/TierTable";
import TreasuryAddress from "@/components/presale/TreasuryAddress";
import { getConfig, getPresaleStatus } from "@/lib/api";

export const metadata: Metadata = {
  title: "Incubator | Vaultor",
  description: "The Vaultor Genesis presale — contribute, track the raise, and check your allocation.",
};

// The raise total changes while people are contributing, so this page is
// rendered per request rather than being prerendered at build time.
export const dynamic = "force-dynamic";

export default async function IncubatorPage() {
  const [statusResult, configResult] = await Promise.allSettled([getPresaleStatus(), getConfig()]);
  const status = statusResult.status === "fulfilled" ? statusResult.value : null;
  const config = configResult.status === "fulfilled" ? configResult.value : null;

  const presaleOpen = config?.presale_open ?? false;
  const hasAddress = Boolean(status?.treasury_address);

  return (
    <section className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
      <PageHeader
        eyebrow="Vaultor Genesis"
        title="The Incubator"
        description="Where the Genesis raise is held. Contribute in SOL, watch the pool fill in real time, and check your allocation at any point."
      />

      {status === null ? (
        <FadeIn delay={0.2} className="mt-16 text-center text-sm text-text-secondary">
          The incubator is warming up. Check back shortly.
        </FadeIn>
      ) : (
        <div className="mt-14 flex flex-col gap-6 sm:mt-16">
          {!presaleOpen && config?.presale_start && (
            <FadeIn>
              <div className="metal-ring flex flex-col items-center gap-4 rounded-xl border border-transparent bg-surface p-6 text-center sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-vault-blue">
                  Presale Opens In
                </p>
                <Countdown />
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.06}>
            <RaiseProgress status={status} />
          </FadeIn>

          {/* The address is withheld by the API while the presale is paused or
              unopened, so contributors can't send early to an address that
              isn't being watched yet. */}
          {hasAddress && presaleOpen ? (
            <FadeIn delay={0.12}>
              <TreasuryAddress address={status.treasury_address} cluster={status.cluster} />
            </FadeIn>
          ) : (
            <FadeIn delay={0.12}>
              <div className="metal-ring flex items-start gap-3 rounded-xl border border-transparent bg-surface p-6 sm:p-8">
                <Lock size={18} className="mt-0.5 shrink-0 text-text-secondary" />
                <div className="text-sm text-text-secondary">
                  <p className="font-semibold text-text-primary">
                    The contribution address is not live yet.
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed">
                    It will appear here, on this page, the moment the presale opens. Anyone sharing
                    an address before then — in a DM, a group chat, or a reply — is not us.
                  </p>
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.18}>
            <TierTable tiers={status.tiers} />
          </FadeIn>

          <FadeIn delay={0.24}>
            <AllocationChecker />
          </FadeIn>
        </div>
      )}
    </section>
  );
}
