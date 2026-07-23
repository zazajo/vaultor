import { CheckCircle2, Circle, Clock, Download } from "lucide-react";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import { getRoadmap, getPhaseFeatures, getDocuments, findDocument, type Phase } from "@/lib/api";

export const metadata: Metadata = {
  title: "Roadmap | Vaultor",
  description: "The path from The Foundation to a fully integrated Vaultor ecosystem.",
};

const STATUS_META: Record<Phase["status"], { label: string; icon: typeof CheckCircle2; className: string }> = {
  complete: { label: "Complete", icon: CheckCircle2, className: "text-vault-blue" },
  current: { label: "In Progress", icon: Clock, className: "text-vault-blue" },
  coming_soon: { label: "Coming Soon", icon: Circle, className: "text-text-secondary" },
};

export default async function RoadmapPage() {
  const [phasesResult, documentsResult] = await Promise.allSettled([getRoadmap(), getDocuments()]);
  const phases = phasesResult.status === "fulfilled" ? phasesResult.value : [];
  const documents = documentsResult.status === "fulfilled" ? documentsResult.value : [];
  const roadmapDoc = findDocument(documents, "Roadmap_Genesis");

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      <PageHeader
        eyebrow="The Journey"
        title="The Vaultor Roadmap"
        description="From the first Observer to a fully integrated decentralized financial network — here's the path we're walking, phase by phase."
      />

      {roadmapDoc && (
        <FadeIn delay={0.2} className="mt-8 flex justify-center">
          <a
            href={roadmapDoc.file}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-vault-blue transition-colors hover:text-text-primary"
          >
            <Download size={16} />
            View Full Roadmap (PDF)
          </a>
        </FadeIn>
      )}

      {phases.length === 0 ? (
        <FadeIn delay={0.2} className="mt-16 text-center text-sm text-text-secondary">
          The roadmap is being drawn up. Check back soon.
        </FadeIn>
      ) : (
        <div className="mt-16 flex flex-col gap-6 sm:mt-20">
          {phases.map((phase, i) => {
            const meta = STATUS_META[phase.status];
            const StatusIcon = meta.icon;
            const features = getPhaseFeatures(phase);
            return (
              <FadeIn key={phase.id} delay={Math.min(i * 0.06, 0.3)}>
                <div className="rounded-xl border border-border-subtle bg-surface p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold uppercase tracking-wide text-text-primary sm:text-xl">
                      {phase.title}
                    </h2>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${meta.className}`}>
                      <StatusIcon size={14} />
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm text-text-secondary sm:text-base">
                    {phase.description}
                  </p>
                  {features.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-secondary"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}
    </section>
  );
}
