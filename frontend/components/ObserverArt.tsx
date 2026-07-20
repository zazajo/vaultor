import OrbitalRing from "@/components/OrbitalRing";

export default function ObserverArt() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
      <div className="orb-gradient orb-breathe absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <OrbitalRing />
    </div>
  );
}
