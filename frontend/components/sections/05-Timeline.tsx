import FadeIn from "@/components/FadeIn";
import OceanHorizon from "@/components/OceanHorizon";
import SectionEyebrow from "@/components/SectionEyebrow";
import Timeline from "@/components/Timeline";

export default function TimelineSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <OceanHorizon intensity="faint" />
      <div className="relative mx-auto max-w-6xl">
        <FadeIn>
          <SectionEyebrow number="03" title="The Journey" />
        </FadeIn>
        <FadeIn delay={0.1} className="mt-10 sm:mt-14">
          <Timeline />
        </FadeIn>
      </div>
    </section>
  );
}
