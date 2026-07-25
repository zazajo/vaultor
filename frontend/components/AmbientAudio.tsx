"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const STORAGE_KEY = "vaultor-audio-muted";
const VOLUME = 0.12;

export default function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  // Read the user's last choice before touching playback.
  useEffect(() => {
    setMuted(window.localStorage.getItem(STORAGE_KEY) === "on");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = VOLUME;
  }, []);

  useEffect(() => {
    if (!ready) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      audio.pause();
      return;
    }

    // Autoplay-with-sound is blocked until a user gesture; try now and retry
    // on the first interaction so playback starts quietly in the background
    // rather than demanding attention up front.
    audio.play().catch(() => {});
    const resume = () => audio.play().catch(() => {});
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    window.addEventListener("scroll", resume, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      window.removeEventListener("scroll", resume);
    };
  }, [muted, ready]);

  const toggle = () => {
    setMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/ambient.mp3" loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "Unmute background audio" : "Mute background audio"}
        aria-pressed={!muted}
        className="metal-ring fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-bg-void/80 text-text-secondary backdrop-blur transition-colors duration-300 hover:text-vault-blue"
        style={{ position: "fixed", boxShadow: muted ? "none" : "0 0 18px var(--vault-glow)" }}
      >
        {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>
    </>
  );
}
