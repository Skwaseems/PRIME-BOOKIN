"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import type { MediaImage } from "@/data/media";

export type ServiceRow = {
  slug: string;
  title: string;
  description: string;
  fromLabel: string | null;
  image: MediaImage;
};

/**
 * Numbered service list. On large screens a preview beside the list
 * crossfades to whichever row is hovered or focused.
 */
export default function ServiceIndex({
  rows,
  intro,
}: {
  rows: ServiceRow[];
  intro: React.ReactNode;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="container-page flex flex-wrap gap-x-[clamp(32px,6vw,96px)] gap-y-10 py-[clamp(64px,9vw,128px)]">
      <div className="max-w-[380px] min-w-0 flex-[1_1_300px]">
        <div className="lg:sticky lg:top-28">
          <div data-reveal>{intro}</div>

          <div
            data-reveal
            className="media-reveal relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-[14px] bg-subtle lg:block"
          >
            {rows.map((row, index) => (
              <div
                key={row.slug}
                aria-hidden={index !== active}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-(--ease-out) ${
                  index === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                }`}
              >
                <SmartImage
                  image={row.image}
                  sizes="380px"
                  fallbackLabel={row.title}
                />
              </div>
            ))}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-5 pt-14 pb-4"
            >
              <p className="display text-lg text-white">{rows[active]?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <ol
        data-reveal
        className="min-w-0 flex-[999_1_560px] border-b border-border-strong"
      >
        {rows.map((row, index) => (
          <li key={row.slug}>
            <Link
              href={`/services/${row.slug}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              className="group grid grid-cols-[56px_minmax(0,1fr)_20px] items-center gap-4 border-t border-border-strong px-1 py-4 transition-[background-color,padding] duration-300 ease-(--ease-out) hover:bg-surface sm:grid-cols-[48px_64px_minmax(0,1fr)_auto_24px] sm:gap-5 sm:px-2 sm:py-5 sm:hover:pl-4"
            >
              <span
                aria-hidden="true"
                className="hidden text-sm font-medium text-faint tabular-nums sm:block"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="relative aspect-square overflow-hidden rounded-[10px] bg-subtle">
                <span className="absolute inset-0 transition-transform duration-700 ease-(--ease-out) group-hover:scale-110">
                  <SmartImage image={row.image} sizes="64px" />
                </span>
              </span>
              <span className="min-w-0">
                <span className="display block text-lg leading-tight tracking-[-0.015em] sm:text-[21px]">
                  {row.title}
                </span>
                <span className="mt-1 block text-sm text-muted sm:text-[15px]">
                  {row.description}
                </span>
                {row.fromLabel && (
                  <span className="mt-1 block text-[13px] text-muted sm:hidden">
                    from{" "}
                    <span className="font-semibold text-foreground">{row.fromLabel}</span>
                  </span>
                )}
              </span>
              {row.fromLabel ? (
                <span className="hidden text-sm whitespace-nowrap text-muted sm:block">
                  from{" "}
                  <span className="font-semibold text-foreground">{row.fromLabel}</span>
                </span>
              ) : (
                <span className="hidden sm:block" />
              )}
              <ArrowRight
                size={20}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-faint transition-[transform,color] duration-300 ease-(--ease-out) group-hover:translate-x-1 group-hover:text-accent-ink"
              />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
