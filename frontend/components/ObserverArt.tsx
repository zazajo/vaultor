import Image from "next/image";
import OrbitalRing from "@/components/OrbitalRing";

export default function ObserverArt() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px]">
      <div className="orb-gradient orb-breathe absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <OrbitalRing className="absolute inset-0 opacity-50" />
      <div
        className="absolute inset-[5%] overflow-hidden rounded-full"
        style={{
          maskImage: "radial-gradient(circle, black 55%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 78%)",
        }}
      >
        <Image
          src="/images/observer-hero.png"
          alt="The Observer, Vaultor's guardian intelligence"
          fill
          priority
          sizes="(min-width: 1024px) 600px, 90vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
