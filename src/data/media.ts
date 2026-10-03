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
};

export type MediaVideo = {
  /** MP4 (H.264) plays everywhere. Keep it short, muted and under ~8 MB. */
  src: string;
  /** Shown before the video loads and if it can't play. */
  poster: MediaImage;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=75`;

export const heroImage: MediaImage = {
  src: unsplash("photo-1488459716781-31db52582fe9"),
  alt: "Fresh vegetables stacked at a local market stall",
};

export const categoryImages: Record<ServiceCategorySlug, MediaImage> = {
  cabs: {
    src: unsplash("photo-1449965408869-eaa3f722e40d"),
    alt: "A car driving along an open road",
  },
  hotels: {
    src: unsplash("photo-1566073771259-6a8506099945"),
    alt: "Hotel building and pool at dusk",
  },
  food: {
    src: unsplash("photo-1517248135467-4c7edcad34c4"),
    alt: "Warmly lit restaurant dining room with set tables",
  },
  medical: {
    src: unsplash("photo-1587854692152-cbe660dbde88"),
    alt: "Assorted tablets and capsules on a table",
  },
  grocery: {
    src: unsplash("photo-1542838132-92c53300491e"),
    alt: "Shelves of fresh produce in a grocery store",
  },
  other: {
    src: unsplash("photo-1441986300917-64674bd600d8"),
    alt: "Interior of a small local shop",
  },
};

export const partnerImage: MediaImage = {
  src: unsplash("photo-1556740749-887f6717d7e4"),
  alt: "Shop owner serving a customer at the counter",
};

export const showcaseVideo: MediaVideo = {
  src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  poster: {
    src: unsplash("photo-1555396273-367ea4eb4db5"),
    alt: "Busy neighbourhood cafe with customers at tables",
  },
};
