import Image from "next/image";
import Hero from "@/components/sections/01-Hero";
import Stats from "@/components/sections/02-Stats";
import Features from "@/components/sections/03-Features";
import Lore from "@/components/sections/04-Lore";
import TimelineSection from "@/components/sections/05-Timeline";
import App from "@/components/sections/07-App";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <Image
            src="/images/cosmic-backdrop.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.15]"
          />
        </div>
        <Stats />
        <Features />
        <Lore />
        <TimelineSection />
      </div>
      <App />
    </>
  );
}
