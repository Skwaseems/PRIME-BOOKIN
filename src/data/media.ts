/**
 * Every photo and video on the site, in one place.
 *
 * These are temporary stock placeholders loaded by URL. To use your own:
 *   - Put files in /public (e.g. /public/media/hero.jpg) and set
 *     `src: "/media/hero.jpg"`, or
 *   - Point `src` at any other https URL, and add its host to
 *     `images.remotePatterns` in next.config.ts (images only; videos can load
 *     from anywhere).
 * Keep `alt` describing what is actually in the photo. If a URL fails to load,
 * the site shows a branded placeholder instead of a broken image.
 */

import type { ServiceCategorySlug } from "@/data/catalog";

export type MediaImage = {
  src: string;
  alt: string;
  /** Prompt for generating this image with an AI image model (Higgsfield). */
  prompt?: string;
};

export type MediaVideo = {
  /** MP4 (H.264) plays everywhere. Keep it short, muted and under ~8 MB. */
  src: string;
  /** Prompt for generating this clip with an AI video model (Higgsfield). */
  prompt?: string;
  /** Shown before the video loads and if it can't play. */
  poster: MediaImage;
};

/**
 * Shared art direction, appended to every generation prompt so the set looks
 * like one shoot and matches the site's warm paper, ink and brand-red palette.
 */
export const ART_DIRECTION =
  "Editorial documentary photograph in a small Indian hill town, natural warm daylight, soft shadows, muted warm palette with occasional deep red accents, 35mm lens, shallow depth of field, authentic and unposed, no text, no logos, no watermarks.";

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=75`;

export const heroImage: MediaImage = {
  src: unsplash("photo-1488459716781-31db52582fe9"),
  alt: "Fresh vegetables stacked at a local market stall",
  prompt:
    "Close view of a neighbourhood market stall with neatly stacked fresh vegetables and a vendor's hands arranging them, morning light.",
};

export const categoryImages: Record<ServiceCategorySlug, MediaImage> = {
  cabs: {
    src: unsplash("photo-1449965408869-eaa3f722e40d"),
    alt: "A car driving along an open road",
    prompt:
      "A clean white hatchback taxi waiting at a quiet town street corner, driver visible through the window, hills in the soft background.",
  },
  hotels: {
    src: unsplash("photo-1566073771259-6a8506099945"),
    alt: "Hotel building and pool at dusk",
    prompt:
      "A small family-run hill-station hotel with a warmly lit entrance and a few potted plants at dusk.",
  },
  food: {
    src: unsplash("photo-1517248135467-4c7edcad34c4"),
    alt: "Warmly lit restaurant dining room with set tables",
    prompt:
      "A cosy neighbourhood cafe counter with a glass of cold coffee and a grilled sandwich being served, warm interior light.",
  },
  medical: {
    src: unsplash("photo-1587854692152-cbe660dbde88"),
    alt: "Assorted tablets and capsules on a table",
    prompt:
      "A tidy local pharmacy counter with medicine boxes on shelves behind and a pharmacist handing over a small paper bag.",
  },
  grocery: {
    src: unsplash("photo-1542838132-92c53300491e"),
    alt: "Shelves of fresh produce in a grocery store",
    prompt:
      "A small kirana grocery store with shelves of daily essentials, milk, bread and eggs near the counter.",
  },
  other: {
    src: unsplash("photo-1441986300917-64674bd600d8"),
    alt: "Interior of a small local shop",
    prompt:
      "A small stationery and gift shop with notebooks, wrapping paper and greeting cards on wooden shelves.",
  },
};

export const partnerImage: MediaImage = {
  src: unsplash("photo-1556740749-887f6717d7e4"),
  alt: "Shop owner serving a customer at the counter",
  prompt:
    "A smiling local shop owner behind the counter checking an order on a phone, ready to pack it.",
};

/**
 * Videos are free Pexels clips, self-hosted from /public/media.
 * Download them with `npm run media:fetch` (sources: scripts/media-sources.json).
 * Until the files exist, the poster photo is shown instead.
 */
export const heroVideo: MediaVideo = {
  src: "/media/hero.mp4",
  poster: heroImage,
};

export const showcaseVideo: MediaVideo = {
  src: "/media/showcase.mp4",
  prompt:
    "Slow cinematic tracking shot along a hill-town main street at golden hour: a taxi pulls up, a cafe owner sets out cups, a pharmacist hands over a paper bag, shoppers pass small grocery and gift shops. Smooth gimbal movement, no cuts, no text.",
  poster: {
    src: unsplash("photo-1555396273-367ea4eb4db5"),
    alt: "Busy neighbourhood cafe with customers at tables",
    prompt:
      "A lively hill-town main street at golden hour with small shops, a taxi passing and people walking, wide shot.",
  },
};
