import { Send, MessageCircle, Globe, X as XIcon, Link as LinkIcon, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import HexBadge from "@/components/HexBadge";
import { getConfig } from "@/lib/api";

export const metadata: Metadata = {
  title: "Community | Vaultor",
  description: "Join the Vaultor community across X, Telegram, Discord, and Reddit.",
};

const PLATFORM_META: Record<string, { label: string; icon: LucideIcon }> = {
  x: { label: "X (Twitter)", icon: XIcon },
  twitter: { label: "X (Twitter)", icon: XIcon },
  telegram: { label: "Telegram", icon: Send },
  discord: { label: "Discord", icon: MessageCircle },
  reddit: { label: "Reddit", icon: Globe },
};

function labelFor(key: string): string {
  return PLATFORM_META[key]?.label ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function iconFor(key: string): LucideIcon {
  return PLATFORM_META[key]?.icon ?? LinkIcon;
}

export default async function CommunityPage() {
  let socialLinks: Record<string, string> = {};
  try {
    const config = await getConfig();
    socialLinks = config.social_links ?? {};
  } catch {
    socialLinks = {};
  }

  const entries = Object.entries(socialLinks);

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      <PageHeader
        eyebrow="Join Us"
        title="The Vaultor Community"
        description="The Observer never sleeps, and neither does the community watching alongside it. Find us wherever you are."
      />

      {entries.length === 0 ? (
        <FadeIn delay={0.2} className="mt-16 text-center text-sm text-text-secondary">
          Community links are being set up. Check back soon.
        </FadeIn>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(([key, url], i) => {
            const Icon = iconFor(key);
            return (
              <FadeIn key={key} delay={Math.min(i * 0.08, 0.3)}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col items-center gap-4 rounded-xl border border-border-subtle bg-surface p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--vault-glow)] hover:shadow-[0_8px_30px_-12px_var(--vault-glow)] sm:p-8"
                >
                  <HexBadge icon={Icon} size={56} />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary group-hover:text-vault-blue">
                    {labelFor(key)}
                  </h3>
                </a>
              </FadeIn>
            );
          })}
        </div>
      )}
    </section>
  );
}
