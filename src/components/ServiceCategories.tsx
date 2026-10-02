"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function ServiceCategories() {
  return (
    <section id="services" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            What you can order
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            One app, every local service
          </h2>
          <p className="mt-3 text-muted">
            Mix and match from six categories into a single cart, checkout
            once, and let every store know exactly what to prepare.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <Link
                href={`/services/${category.slug}`}
                className="card-flat group relative block overflow-hidden rounded-2xl p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-accent/30"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} text-xl text-white shadow-md`}
                >
                  {category.emoji}
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold">
                  {category.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Browse now →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
