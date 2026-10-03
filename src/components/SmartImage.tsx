"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { MediaImage } from "@/data/media";

/**
 * next/image with a designed fallback: if the URL fails to load, the slot
 * keeps its size and shows a quiet branded tile instead of a broken image.
 * The parent must be positioned and sized (the image uses `fill`).
 */
export default function SmartImage({
  image,
  sizes,
  priority = false,
  className = "",
  fallbackLabel,
}: {
  image: MediaImage;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Short text for the fallback tile, e.g. the category name. */
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // An image that errors before hydration never fires onError, so check once
  // after mount as well.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [image.src]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={image.alt}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-subtle text-muted"
      >
        <ImageOff size={22} strokeWidth={1.5} aria-hidden="true" />
        {fallbackLabel && (
          <span className="px-3 text-center text-xs font-medium">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <Image
      ref={imgRef}
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
