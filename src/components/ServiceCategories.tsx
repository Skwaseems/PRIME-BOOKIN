import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";
import { offerings } from "@/data/catalog";
import { formatINR } from "@/lib/format";

function lowestPrice(slug: string) {
  const prices = offerings.filter((o) => o.category === slug).map((o) => o.price);
  return prices.length ? Math.min(...prices) : null;
}

export default function ServiceCategories() {
  return (
    <section id="services" aria-labelledby="services-title">
      <div className="container-page flex flex-wrap gap-x-[clamp(32px,6vw,96px)] gap-y-10 py-[clamp(64px,9vw,128px)]">
        <div data-reveal className="max-w-[380px] min-w-0 flex-[1_1_300px]">
          <p className="eyebrow-accent">Services</p>
          <h2 id="services-title" className="section-heading mt-3.5">
            Six kinds of local, in the same cart.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Add items from any category to the same cart. Each store is notified
            of exactly what to prepare.
          </p>
        </div>

        <ol data-reveal className="min-w-0 flex-[999_1_560px] border-b border-border-strong">
          {categories.map((category, index) => {
            const from = lowestPrice(category.slug);
            return (
              <li key={category.slug}>
                <Link
                  href={`/services/${category.slug}`}
                  className="group grid grid-cols-[44px_minmax(0,1fr)_20px] items-center gap-4 border-t border-border-strong px-1 py-5 transition-[background-color,padding] duration-300 ease-(--ease-out) hover:bg-surface sm:grid-cols-[48px_44px_minmax(0,1fr)_auto_24px] sm:gap-5 sm:px-2 sm:py-[26px] sm:hover:pl-4"
                >
                  <span
                    aria-hidden="true"
                    className="hidden text-sm font-medium text-faint tabular-nums sm:block"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
                  >
                    <category.icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="display block text-lg leading-tight tracking-[-0.015em] sm:text-[21px]">
                      {category.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted sm:text-[15px]">
                      {category.description}
                    </span>
                    {from !== null && (
                      <span className="mt-1 block text-[13px] text-muted sm:hidden">
                        from <span className="font-semibold text-foreground">{formatINR(from)}</span>
                      </span>
                    )}
                  </span>
                  {from !== null ? (
                    <span className="hidden text-sm whitespace-nowrap text-muted sm:block">
                      from <span className="font-semibold text-foreground">{formatINR(from)}</span>
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
            );
          })}
        </ol>
      </div>
    </section>
  );
}
