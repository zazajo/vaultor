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
      <Stats />
      <Features />
      <Lore />
      <TimelineSection />
      <App />
    </>
  );
}
