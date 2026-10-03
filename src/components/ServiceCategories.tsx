import { categories } from "@/data/categories";
import { offerings, type ServiceCategorySlug } from "@/data/catalog";
import { categoryImages } from "@/data/media";
import ServiceIndex, { type ServiceRow } from "@/components/ServiceIndex";
import { formatINR } from "@/lib/format";

function lowestPrice(slug: string) {
  const prices = offerings.filter((o) => o.category === slug).map((o) => o.price);
  return prices.length ? Math.min(...prices) : null;
}

export default function ServiceCategories() {
  const rows: ServiceRow[] = categories.map((category) => {
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
      <ServiceIndex
        rows={rows}
        intro={
          <>
            <p className="eyebrow-accent">Services</p>
            <h2 id="services-title" className="section-heading mt-3.5">
              Six kinds of local, in the same cart.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-body">
              Add items from any category to the same cart. Each store is
              notified of exactly what to prepare.
            </p>
          </>
        }
      />
    </section>
  );
}
