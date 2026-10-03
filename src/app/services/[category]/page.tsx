import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OfferingCard from "@/components/OfferingCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartBar from "@/components/CartBar";
import SmartImage from "@/components/SmartImage";
import { categoryImages } from "@/data/media";
import { formatINR } from "@/lib/format";
import { DELIVERY_CHARGE_PER_STORE } from "@/lib/pricing";
import { categories } from "@/data/categories";
import { siteConfig } from "@/lib/site";
import {
  categoryMeta,
  getOfferingsByCategory,
  type ServiceCategorySlug,
} from "@/data/catalog";

export function generateStaticParams() {
  return Object.keys(categoryMeta).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!(category in categoryMeta)) return {};

  const slug = category as ServiceCategorySlug;
  const meta = categoryMeta[slug];
  const title = meta.title;
  const description = `${meta.subtitle} Browse ${meta.title.toLowerCase()} near you on ${siteConfig.name} and add items to your shared cart.`;
  const path = `/services/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!(category in categoryMeta)) {
    notFound();
  }

  const slug = category as ServiceCategorySlug;
  const meta = categoryMeta[slug];
  const items = getOfferingsByCategory(slug);
  const current = categories.find((c) => c.slug === slug);
  const stores = Array.from(
    items
      .reduce((groups, item) => {
        const group = groups.get(item.storeId) ?? {
          name: item.storeName,
          items: [] as typeof items,
        };
        group.items.push(item);
        return groups.set(item.storeId, group);
      }, new Map<string, { name: string; items: typeof items }>())
      .entries(),
  );

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-8 pb-16 sm:pt-10 sm:pb-24">
        <div className="container-page">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/#services" },
              { label: meta.title },
            ]}
          />

          <div className="animate-media-in ken-burns relative isolate mt-6 flex min-h-[300px] items-end overflow-hidden rounded-[var(--radius-card)] bg-night sm:min-h-[380px]">
            <SmartImage
              image={categoryImages[slug]}
              sizes="(min-width: 1200px) 1136px, 100vw"
              priority
              fallbackLabel={meta.title}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0b1a15]/90 via-[#0b1a15]/40 to-transparent"
            />
            <div className="relative flex w-full flex-wrap items-end justify-between gap-x-6 gap-y-4 p-5 text-white sm:p-8">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                {current && (
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-marigold text-[#13201a] sm:h-16 sm:w-16"
                  >
                    <current.icon size={26} strokeWidth={1.75} />
                  </span>
                )}
                <div className="min-w-0">
                  <h1 className="page-title text-white">{meta.title}</h1>
                  <p className="mt-2.5 text-base text-white/85">
                    {meta.subtitle}
                  </p>
                </div>
              </div>
              <p className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm">
                {items.length} item{items.length === 1 ? "" : "s"} ·{" "}
                {stores.length} store{stores.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <nav
            aria-label="Service categories"
            className="-mx-4 mt-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          >
            <ul className="flex gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/services/${c.slug}`}
                    aria-current={c.slug === slug ? "page" : undefined}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-sm font-medium whitespace-nowrap text-foreground/80 transition-colors hover:border-foreground hover:text-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background"
                  >
                    <c.icon size={15} aria-hidden="true" />
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 flex flex-col gap-4">
            {stores.map(([storeId, store]) => (
              <section
                key={storeId}
                aria-labelledby={`store-${storeId}`}
                className="panel overflow-hidden"
              >
                <header className="panel-header">
                  <h2 id={`store-${storeId}`} className="section-title">
                    {store.name}
                  </h2>
                  <span className="text-[13px] text-muted">
                    Delivery {formatINR(DELIVERY_CHARGE_PER_STORE)} per store
                  </span>
                </header>
                {store.items.map((offering) => (
                  <OfferingCard key={offering.id} offering={offering} />
                ))}
              </section>
            ))}
          </div>

          <p className="mt-5 text-[13px] text-muted">
            Prices are for the item only. Delivery and GST are added in your
            cart.
          </p>
        </div>
        <CartBar />
      </main>
      <Footer />
    </>
  );
}
