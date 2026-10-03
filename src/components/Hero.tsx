"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/categories";
import { heroVideo } from "@/data/media";
import AmbientVideo from "@/components/AmbientVideo";
import GoogleIcon from "@/components/GoogleIcon";
import HeroCart from "@/components/HeroCart";

const promises = [
  "Several stores, one checkout",
  "Cash on delivery",
  "Sign in with Google",
];

export default function Hero() {
  const { user, loading, error, signInWithGoogle } = useAuth();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-night text-night-foreground"
    >
      <div className="absolute inset-0 -z-10">
        <AmbientVideo
          video={heroVideo}
          label="Video of vegetable vendors at a local market"
          posterSizes="100vw"
          priority
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night via-night/90 to-night/45"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent"
        />
      </div>

      <div className="container-page grid items-center gap-x-16 gap-y-14 pt-[clamp(48px,8vw,112px)] pb-[clamp(64px,8vw,120px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0">
          <p className="animate-rise inline-flex items-center gap-2 rounded-full bg-marigold px-3.5 py-1.5 text-[13px] font-semibold text-[#13201a]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#13201a]"
            />
            Cabs · Hotels · Food · Medicines · Groceries
          </p>
          <h1
            id="hero-title"
            className="display animate-rise mt-6 text-[clamp(2.5rem,6.4vw,5.25rem)] leading-[0.98] text-balance text-white [animation-delay:80ms]"
          >
            Everything local, <span className="text-marigold">one cart</span>{" "}
            away.
          </h1>
          <p className="animate-rise mt-6 max-w-[34rem] text-[clamp(1rem,1.4vw,1.1875rem)] leading-relaxed text-night-muted [animation-delay:160ms]">
            Order from your cab service, hotel, cafe, pharmacy and grocery store
            in a single cart, and check out once.
          </p>

          <div className="animate-rise mt-9 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row sm:flex-wrap">
            <Link href="/#services" className="btn btn-lg btn-primary">
              Browse services
              <ArrowRight size={16} aria-hidden="true" className="icon-nudge" />
            </Link>
            {!loading && !user && (
              <button
                onClick={signInWithGoogle}
                className="btn btn-lg border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white/15"
              >
                <GoogleIcon size={18} />
                Continue with Google
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="alert-error mt-4 max-w-md">
              {error}
            </p>
          )}

          <nav
            aria-label="Jump to a service"
            className="animate-rise mt-10 [animation-delay:340ms]"
          >
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services/${category.slug}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-3.5 text-sm font-medium text-white/90 transition-colors hover:border-marigold hover:bg-marigold hover:text-[#13201a]"
                  >
                    <category.icon size={15} aria-hidden="true" />
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="animate-rise mt-8 flex flex-wrap gap-x-7 gap-y-2.5 text-sm text-night-muted [animation-delay:420ms]">
            {promises.map((promise) => (
              <li key={promise} className="flex items-center gap-2">
                <Check
                  size={16}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  className="text-marigold"
                />
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 justify-center lg:justify-end">
          <HeroCart />
        </div>
      </div>
    </section>
  );
}
