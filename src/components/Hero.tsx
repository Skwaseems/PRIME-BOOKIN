"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleIcon from "@/components/GoogleIcon";

export default function Hero() {
  const { user, loading, error, signInWithGoogle } = useAuth();

  return (
    <section className="border-b border-border bg-surface">
      <div className="container-page py-16 sm:py-24">
        <p className="eyebrow">Cabs · Hotels · Food · Medicines · Groceries</p>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Everything local, one cart away.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Order from your cab service, hotel, cafe, pharmacy and grocery store
          in a single cart, and check out once.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/#services" className="btn btn-lg btn-primary">
            Browse services
            <ArrowRight size={16} aria-hidden="true" />
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
      </div>
    </section>
  );
}
