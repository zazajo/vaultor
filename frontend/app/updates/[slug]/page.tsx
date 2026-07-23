import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import { getUpdate } from "@/lib/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getUpdate(slug);
    return { title: `${post.title} | Vaultor Updates` };
  } catch {
    return { title: "Update | Vaultor" };
  }
}

export default async function UpdatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getUpdate(slug);
  } catch {
    notFound();
  }

  return (
    <article className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
      <FadeIn>
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          All Updates
        </Link>
      </FadeIn>

      <FadeIn delay={0.1}>
        {post.category && (
          <span className="mt-8 block text-xs font-semibold uppercase tracking-[0.15em] text-vault-blue">
            {post.category}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-text-primary sm:text-4xl">
          {post.title}
        </h1>
        <span className="mt-3 block text-sm text-text-secondary">
          {formatDate(post.created_at)}
        </span>
      </FadeIn>

      {post.cover_image && (
        <FadeIn delay={0.15}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt=""
            className="mt-8 w-full rounded-xl border border-border-subtle object-cover"
          />
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
        <p className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-text-secondary">
          {post.body}
        </p>
      </FadeIn>
    </article>
  );
}
