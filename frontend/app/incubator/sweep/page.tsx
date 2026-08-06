import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SweepPanel from "@/components/presale/SweepPanel";

// Deliberately unlisted: no Nav entry, no sitemap entry, and excluded from
// indexing here. That's obscurity, not the access control — the real gate is
// that only whoever holds the connected wallet's private key can sign
// anything on this page. See SweepPanel's own comment for the full reasoning.
export const metadata: Metadata = {
  title: "Sweep | Vaultor",
  robots: { index: false, follow: false },
};

export default function SweepPage() {
  return (
    <section className="relative mx-auto max-w-2xl px-4 py-20 sm:px-6 sm:py-24">
      <PageHeader
        eyebrow="Internal"
        title="Sweep Incubator Funds"
        description="Move a wallet's full balance to a destination you specify, signed by whatever wallet you connect."
      />
      <div className="mt-14 sm:mt-16">
        <SweepPanel />
      </div>
    </section>
  );
}
