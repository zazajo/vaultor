const HORIZON = 62; // percent from top

// Precomputed so server and client render identically (no random at runtime).
const MOTES = [
  { left: 6, top: 88, size: 2, duration: 74, delay: -12 },
  { left: 14, top: 55, size: 3, duration: 96, delay: -48 },
  { left: 23, top: 78, size: 2, duration: 62, delay: -30 },
  { left: 31, top: 92, size: 2, duration: 88, delay: -70 },
  { left: 42, top: 66, size: 3, duration: 108, delay: -22 },
  { left: 50, top: 84, size: 2, duration: 70, delay: -55 },
  { left: 58, top: 72, size: 2, duration: 94, delay: -8 },
  { left: 67, top: 90, size: 3, duration: 80, delay: -40 },
  { left: 74, top: 60, size: 2, duration: 66, delay: -62 },
  { left: 82, top: 82, size: 2, duration: 102, delay: -18 },
  { left: 90, top: 70, size: 3, duration: 76, delay: -35 },
  { left: 96, top: 94, size: 2, duration: 90, delay: -52 },
];

const MISTS = [
  { top: 48, left: -10, width: 75, height: 150, duration: 150, delay: 0 },
  { top: 55, left: 25, width: 85, height: 130, duration: 190, delay: -60 },
  { top: 59, left: -5, width: 65, height: 110, duration: 240, delay: -120 },
];

export default function OceanHorizon({
  intensity = "faint",
  className,
}: {
  /** "faint" for behind dense text, "medium" for showcase sections */
  intensity?: "faint" | "medium";
  className?: string;
}) {
  const opacity = intensity === "medium" ? 0.8 : 0.45;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ opacity }}
    >
      {/* Sky-to-water gradient with a darker shift at the horizon */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            rgba(5, 5, 8, 0) 0%,
            rgba(10, 15, 32, 0.35) 42%,
            rgba(13, 20, 42, 0.45) ${HORIZON - 1}%,
            rgba(4, 6, 13, 0.6) ${HORIZON + 1}%,
            rgba(3, 4, 9, 0.75) 100%)`,
        }}
      />

      {/* Moon glow, upper right, very soft */}
      <div
        className="absolute"
        style={{
          left: "58%",
          top: "-4%",
          width: "34rem",
          height: "34rem",
          background:
            "radial-gradient(circle, rgba(190, 210, 255, 0.28) 0%, rgba(150, 180, 255, 0.10) 34%, transparent 68%)",
        }}
      />

      {/* Drifting mist banks hugging the horizon */}
      {MISTS.map((mist, i) => (
        <div
          key={i}
          className="oh-drift absolute"
          style={{
            top: `${mist.top}%`,
            left: `${mist.left}%`,
            width: `${mist.width}%`,
            height: mist.height,
            background:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(120, 150, 220, 0.09) 0%, transparent 70%)",
            animationDuration: `${mist.duration}s`,
            animationDelay: `${mist.delay}s`,
          }}
        />
      ))}

      {/* Thin reflective horizon line */}
      <div
        className="absolute h-px w-full"
        style={{
          top: `${HORIZON}%`,
          background:
            "linear-gradient(to right, transparent 4%, rgba(165, 195, 255, 0.28) 35%, rgba(190, 212, 255, 0.42) 66%, rgba(165, 195, 255, 0.2) 88%, transparent 98%)",
        }}
      />

      {/* Soft light column reflecting beneath the moon */}
      <div
        className="absolute"
        style={{
          left: "68%",
          top: `${HORIZON}%`,
          width: "9rem",
          height: `${100 - HORIZON}%`,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse 50% 100% at 50% 0%, rgba(170, 200, 255, 0.16) 0%, rgba(150, 185, 255, 0.05) 55%, transparent 80%)",
        }}
      />

      {/* Sparse light motes drifting upward */}
      {MOTES.map((mote, i) => (
        <span
          key={i}
          className="oh-rise absolute rounded-full"
          style={{
            left: `${mote.left}%`,
            top: `${mote.top}%`,
            width: mote.size,
            height: mote.size,
            background: "rgba(195, 214, 255, 0.5)",
            opacity: 0.3,
            animationDuration: `${mote.duration}s`,
            animationDelay: `${mote.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
