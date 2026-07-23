import FadeIn from "@/components/FadeIn";

export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <FadeIn>
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-vault-blue" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-vault-blue sm:text-sm">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-vault-blue" />
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <h1 className="hero-headline mt-5 font-extrabold uppercase tracking-tighter text-gradient-silver sm:mt-6">
          {title}
        </h1>
      </FadeIn>
      {description && (
        <FadeIn delay={0.2}>
          <p className="mx-auto mt-5 max-w-[56ch] text-base text-text-secondary sm:mt-6 sm:text-lg">
            {description}
          </p>
        </FadeIn>
      )}
    </div>
  );
}
