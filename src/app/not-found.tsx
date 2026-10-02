import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { categories } from "@/data/categories";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-16">
        <div className="card-flat mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl p-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Compass size={26} />
          </div>
          <p className="font-display text-6xl font-bold text-accent">404</p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            This page wandered off
          </h1>
          <p className="text-muted">
            We couldn&apos;t find the page you were looking for. It may have
            been moved, or the link might be out of date.
          </p>

          <Link
            href="/"
            className="mt-2 flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-accent/30 hover:bg-accent/90"
          >
            <Home size={16} />
            Back to home
          </Link>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-surface-border pt-4">
            <span className="text-xs font-medium text-muted">
              Or jump straight to:
            </span>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="rounded-full border border-surface-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent hover:text-accent"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
