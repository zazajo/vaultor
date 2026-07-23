import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import SectionDivider from "@/components/SectionDivider";

export default function Lore() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <Image
        src="/images/manifesto-scene.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-void/90 via-bg-void/80 to-bg-void/90" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <FadeIn>
          <SectionDivider />
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-lg font-semibold uppercase leading-relaxed tracking-wide text-text-primary sm:text-xl">
            Before the Vaults. Before the Systems.
            <br />
            <span className="text-vault-blue">Before the Protocols.</span>
            <br />
            There Was the First Observer.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
