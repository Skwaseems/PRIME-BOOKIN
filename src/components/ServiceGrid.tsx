import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import type { MediaImage } from "@/data/media";

export type ServiceTile = {
  slug: string;
  title: string;
  description: string;
  fromLabel: string | null;
  image: MediaImage;
};

// Bento layout on large screens: the first tile is 2×2, the rest fill a 3×3 grid.
const spans = [
  "lg:col-span-2 lg:row-span-2",
  "",
  "",
  "",
  "",
  "sm:col-span-2 lg:col-span-1",
];

export default function ServiceGrid({ tiles }: { tiles: ServiceTile[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:auto-rows-[248px] lg:grid-cols-3">
      {tiles.map((tile, index) => {
        const lead = index === 0;
        return (
          <li
            key={tile.slug}
            data-reveal
            style={{ transitionDelay: `${index * 70}ms` }}
            className={`${spans[index] ?? ""} ${lead ? "sm:col-span-2" : ""}`}
          >
            <Link
              href={`/services/${tile.slug}`}
              className={`group relative flex h-full flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-night text-white ${
                lead
                  ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto"
                  : "aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto"
              }`}
            >
              <span className="absolute inset-0 transition-transform duration-[1.2s] ease-(--ease-out) group-hover:scale-[1.06]">
                <SmartImage
                  image={tile.image}
                  sizes={
                    lead
                      ? "(min-width: 1024px) 760px, 100vw"
                      : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  }
                  fallbackLabel={tile.title}
                />
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0b1a15]/90 via-[#0b1a15]/35 to-transparent"
              />

              <span
                aria-hidden="true"
                className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-[background-color,color,transform] duration-300 ease-(--ease-out) group-hover:rotate-45 group-hover:bg-marigold group-hover:text-[#13201a]"
              >
                <ArrowUpRight size={20} strokeWidth={2} />
              </span>

              <span className="relative block p-5 sm:p-6">
                {tile.fromLabel && (
                  <span className="mb-3 inline-flex rounded-full bg-marigold px-2.5 py-1 text-xs font-semibold text-[#13201a]">
                    from {tile.fromLabel}
                  </span>
                )}
                <span
                  className={`display block leading-tight ${
                    lead ? "text-[clamp(1.75rem,3vw,2.5rem)]" : "text-[22px]"
                  }`}
                >
                  {tile.title}
                </span>
                <span
                  className={`mt-1.5 block text-white/80 ${
                    lead ? "max-w-md text-base" : "line-clamp-2 text-sm"
                  }`}
                >
                  {tile.description}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
