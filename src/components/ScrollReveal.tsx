"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fades in elements marked with `data-reveal` as they scroll into view.
 * Elements are only hidden after this runs (via the `js-reveal` class on
 * <html>), so content stays visible without JS or with reduced motion.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)")
    );
    // Anything already on screen is shown at once so nothing flickers.
    const viewport = window.innerHeight;
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < viewport * 0.9) {
        el.classList.add("is-revealed");
      }
    });
    root.classList.add("js-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    targets.forEach((el) => {
      if (!el.classList.contains("is-revealed")) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
