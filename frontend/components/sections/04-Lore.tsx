import FadeIn from "@/components/FadeIn";
import SectionDivider from "@/components/SectionDivider";

export default function Lore() {
  return (
    <section className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
      <FadeIn>
        <SectionDivider />
      </FadeIn>
      <FadeIn delay={0.1}>
        <p className="mx-auto mt-10 max-w-2xl text-center text-lg font-semibold uppercase leading-relaxed tracking-wide text-text-secondary sm:text-xl">
          Before the Vaults. Before the Systems.
          <br />
          <span className="text-vault-blue">Before the Protocols.</span>
          <br />
          There Was the First Observer.
        </p>
      </FadeIn>
    </section>
  );
}
