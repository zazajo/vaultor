"use client";

const STAR_COUNT = 60;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
  const top = seededRandom(i * 12.9898 + 1) * 100;
  const left = seededRandom(i * 78.233 + 1) * 100;
  const size = 1 + seededRandom(i * 37.719 + 1) * 1.4;
  const opacity = 0.12 + seededRandom(i * 93.989 + 1) * 0.28;
  const drifts = i % 2 === 0;
  const duration = 8 + seededRandom(i * 15.731 + 1) * 10;
  const delay = -seededRandom(i * 3.147 + 1) * duration;
  return {
    top: top.toFixed(3),
    left: left.toFixed(3),
    size: size.toFixed(3),
    opacity: opacity.toFixed(3),
    drifts,
    duration: duration.toFixed(3),
    delay: delay.toFixed(3),
  };
});

export default function CosmicBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="orb-gradient orb-breathe h-[60vmax] w-[60vmax] rounded-full blur-3xl" />
      </div>
      {stars.map((star, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-text-primary ${star.drifts ? "star-drift" : ""}`}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            ...(star.drifts
              ? { animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s` }
              : {}),
          }}
        />
      ))}
    </div>
  );
}
