import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OfferingCard from "@/components/OfferingCard";
import Breadcrumbs from "@/components/Breadcrumbs";
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
  const otherCategories = categories.filter((c) => c.slug !== slug);

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 py-8 sm:py-10">
        <div className="container-page">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/#services" },
              { label: meta.title },
            ]}
          />

          <h1 className="page-title mt-4">{meta.title}</h1>
          <p className="mt-1 text-muted">{meta.subtitle}</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>

          <nav
            aria-labelledby="other-services"
            className="mt-12 border-t border-border pt-6"
          >
            <h2 id="other-services" className="eyebrow">
              Other services
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services/${category.slug}`}
                    className="btn btn-sm btn-secondary"
                  >
                    <category.icon size={14} aria-hidden="true" />
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
