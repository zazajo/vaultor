import Link from "next/link";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import { getUpdates, type Post } from "@/lib/api";

export const metadata: Metadata = {
  title: "Updates | Vaultor",
  description: "Announcements and progress reports from the Vaultor team.",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function UpdatesPage() {
  let posts: Post[] = [];
  try {
    posts = await getUpdates();
  } catch {
    posts = [];
  }

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      <PageHeader
        eyebrow="Vaultor Updates"
        title="Latest From the Vault"
        description="Announcements, progress reports, and everything shipping as we build out the Vaultor ecosystem."
      />

      {posts.length === 0 ? (
        <FadeIn delay={0.2} className="mt-16 text-center text-sm text-text-secondary">
          No updates have been posted yet.
        </FadeIn>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2">
          {posts.map((post, i) => (
            <FadeIn key={post.id} delay={Math.min(i * 0.06, 0.3)}>
              <Link
                href={`/updates/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--vault-glow)] hover:shadow-[0_8px_30px_-12px_var(--vault-glow)]"
              >
                {post.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image}
                    alt=""
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-3 p-6 sm:p-8">
                  {post.category && (
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-vault-blue">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-lg font-semibold text-text-primary group-hover:text-vault-blue sm:text-xl">
                    {post.title}
                  </h2>
                  <p className="line-clamp-3 text-sm text-text-secondary">{post.body}</p>
                  <span className="mt-auto pt-2 text-xs text-text-secondary">
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
