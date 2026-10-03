import { categories } from "@/data/categories";
import { offerings, type ServiceCategorySlug } from "@/data/catalog";
import { categoryImages } from "@/data/media";
import ServiceGrid, { type ServiceTile } from "@/components/ServiceGrid";
import { formatINR } from "@/lib/format";

function lowestPrice(slug: string) {
  const prices = offerings
    .filter((o) => o.category === slug)
    .map((o) => o.price);
  return prices.length ? Math.min(...prices) : null;
}

export default function ServiceCategories() {
  const tiles: ServiceTile[] = categories.map((category) => {
    const from = lowestPrice(category.slug);
    return {
      slug: category.slug,
      title: category.title,
      description: category.description,
      fromLabel: from === null ? null : formatINR(from),
      image: categoryImages[category.slug as ServiceCategorySlug],
    };
  });

  return (
    <section id="services" aria-labelledby="services-title">
      <div className="container-page py-[clamp(64px,9vw,120px)]">
        <div
          data-reveal
          className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4"
        >
          <div className="max-w-xl">
            <p className="eyebrow-accent">Services</p>
            <h2 id="services-title" className="section-heading mt-3.5">
              Six kinds of local, in the same cart.
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-body">
            Add items from any category to the same cart. Each store is notified
            of exactly what to prepare.
          </p>
        </div>

        <div className="mt-10 sm:mt-12">
          <ServiceGrid tiles={tiles} />
        </div>
      </div>
    </section>
  );
}
