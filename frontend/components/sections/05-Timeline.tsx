import FadeIn from "@/components/FadeIn";
import SectionEyebrow from "@/components/SectionEyebrow";
import Timeline from "@/components/Timeline";

export default function TimelineSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <FadeIn>
        <SectionEyebrow number="03" title="The Journey" />
      </FadeIn>
      <FadeIn delay={0.1} className="mt-10 sm:mt-14">
        <Timeline />
      </FadeIn>
    </section>
  );
}
