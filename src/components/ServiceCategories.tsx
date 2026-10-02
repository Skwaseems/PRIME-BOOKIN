import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categories } from "@/data/categories";

export default function ServiceCategories() {
  return (
    <section id="services" className="container-page py-16">
      <div className="max-w-xl">
        <h2 className="text-2xl font-semibold tracking-tight">Services</h2>
        <p className="mt-2 text-muted">
          Add items from any category to the same cart. Each store is notified
          of exactly what to prepare.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/services/${category.slug}`}
              className="panel group flex h-full items-start gap-4 p-5 transition-colors hover:border-accent/40 hover:bg-subtle/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-ink">
                <category.icon size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{category.title}</span>
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {category.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
