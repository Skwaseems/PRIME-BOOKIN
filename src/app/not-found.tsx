import type { Metadata } from "next";
import Link from "next/link";
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
      <main id="main" className="flex-1 py-20 sm:py-28">
        <div className="container-page max-w-xl">
          <p className="eyebrow-accent">Error 404</p>
          <h1 className="page-title mt-3">Page not found</h1>
          <p className="mt-4 text-base leading-relaxed text-body">
            The page you&apos;re looking for doesn&apos;t exist. It may have
            been moved, or the link may be out of date.
          </p>
          <Link href="/" className="btn btn-lg btn-primary mt-8">
            Go to home
          </Link>

          <div className="mt-12 border-t border-border pt-7">
            <h2 className="eyebrow">Browse a service</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services/${category.slug}`}
                    className="btn btn-sm btn-secondary"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
