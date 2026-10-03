"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleIcon from "@/components/GoogleIcon";
import HeroCart from "@/components/HeroCart";
import SmartImage from "@/components/SmartImage";
import { heroImage } from "@/data/media";

const promises = [
  "Several stores, one checkout",
  "Cash on delivery",
  "Sign in with Google",
];

export default function Hero() {
  const { user, loading, error, signInWithGoogle } = useAuth();

  return (
    <section aria-labelledby="hero-title" className="border-b border-border">
      <div className="container-page flex flex-wrap items-center gap-x-[clamp(40px,6vw,88px)] gap-y-14 pt-[clamp(40px,8vw,104px)] pb-[clamp(56px,8vw,112px)]">
        <div className="min-w-0 flex-[1_1_480px]">
          <p className="animate-rise inline-flex items-center gap-2.5 text-[13px] font-medium text-muted">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            Cabs · Hotels · Food · Medicines · Groceries
          </p>
          <h1
            id="hero-title"
            className="display animate-rise mt-5 text-[clamp(2.5rem,6.2vw,4.75rem)] leading-[0.98] tracking-[-0.035em] text-balance [animation-delay:80ms]"
          >
            Everything local, <span className="text-accent-ink">one cart</span> away.
          </h1>
          <p className="animate-rise mt-6 max-w-[34rem] text-[clamp(1rem,1.4vw,1.1875rem)] leading-relaxed text-body [animation-delay:160ms]">
            Order from your cab service, hotel, cafe, pharmacy and grocery store
            in a single cart, and check out once.
          </p>

          <div className="animate-rise mt-9 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row sm:flex-wrap">
            <Link href="/#services" className="btn btn-lg btn-primary">
              Browse services
              <ArrowRight size={16} aria-hidden="true" className="icon-nudge" />
            </Link>
            {!loading && !user && (
              <button onClick={signInWithGoogle} className="btn btn-lg btn-secondary">
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

          <ul className="animate-rise mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-border-strong pt-5 text-sm text-body [animation-delay:400ms]">
            {promises.map((promise) => (
              <li key={promise} className="flex items-center gap-2">
                <Check
                  size={16}
                  strokeWidth={2.25}
                  aria-hidden="true"
                  className="text-accent-ink"
                />
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 flex-[1_1_360px]">
          <div className="mx-auto flex w-full max-w-[520px] flex-col">
            <div className="animate-media-in ken-burns relative ml-auto aspect-[4/5] w-[82%] overflow-hidden rounded-[14px] bg-subtle sm:w-[78%]">
              <SmartImage
                image={heroImage}
                sizes="(min-width: 1024px) 400px, 80vw"
                priority
                fallbackLabel="Hero photo"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
              />
            </div>
            <div className="relative -mt-[45%] w-[88%] sm:w-[84%]">
              <HeroCart />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
