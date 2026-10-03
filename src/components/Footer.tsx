import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { categories } from "@/data/categories";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-wrap justify-between gap-x-16 gap-y-10 pt-14 pb-10 sm:pt-16">
        <div className="max-w-[340px] flex-[1_1_260px]">
          <Link href="/" aria-label="Prime Bookin home" className="inline-flex min-h-11 items-center rounded-md">
            <Wordmark withMark={false} />
          </Link>
          <p className="mt-3.5 text-sm leading-relaxed text-muted">
            Cabs, hotels, food, medicines and groceries from local stores, in
            one cart and one checkout.
          </p>
        </div>

        <nav aria-labelledby="footer-services">
          <h2 id="footer-services" className="eyebrow">
            Services
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/services/${category.slug}`}
                  className="inline-flex min-h-9 items-center"
                >
                  <span className="link-draw">{category.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Contact</h2>
          <ul className="mt-4 flex flex-col gap-1 text-sm">
            <li>
              <a
                href={`mailto:${siteConfig.email}?subject=Partner%20with%20Prime%20Bookin`}
                className="inline-flex min-h-9 items-center"
              >
                <span className="link-draw">Register your store</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="inline-flex min-h-9 items-center break-all">
                <span className="link-draw">{siteConfig.email}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-wrap justify-between gap-2 py-5 text-[13px] text-muted">
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
          <p>www.primebookin.in</p>
        </div>
      </div>
    </footer>
  );
}
