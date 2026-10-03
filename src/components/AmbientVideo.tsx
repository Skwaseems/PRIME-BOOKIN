"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import type { MediaVideo } from "@/data/media";

/**
 * Muted, looping background video with a poster image.
 * - Plays only while on screen, and never auto-plays under reduced motion.
 * - Has a visible pause/play control (moving content must be pausable).
 * - Falls back to the poster if the file can't play.
 */
export default function AmbientVideo({
  video,
  label,
  posterSizes = "100vw",
  priority = false,
}: {
  video: MediaVideo;
  /** Accessible name for the video region. */
  label: string;
  /** `sizes` for the poster image. */
  posterSizes?: string;
  /** Load the poster eagerly (above-the-fold videos). */
  priority?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  // Set when the viewer pauses it, so scrolling back doesn't restart it.
  const userPaused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || failed) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      userPaused.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          el.play().catch(() => setPaused(true));
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [failed]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      el.play().catch(() => setPaused(true));
    } else {
      userPaused.current = true;
      el.pause();
    }
  };

  return (
    <div role="region" aria-label={label} className="absolute inset-0">
      <SmartImage
        image={video.poster}
        sizes={posterSizes}
        priority={priority}
      />
      {!failed && (
        <video
          ref={ref}
          src={video.src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {!failed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play video" : "Pause video"}
          className="absolute right-4 bottom-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 sm:right-6 sm:bottom-6"
        >
          {paused ? (
            <Play size={16} fill="currentColor" aria-hidden="true" />
          ) : (
            <Pause size={16} fill="currentColor" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
