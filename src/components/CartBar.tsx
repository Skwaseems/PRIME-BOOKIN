"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

/** Floating summary shown on listing pages once the cart has items. */
export default function CartBar() {
  const { itemCount, subtotal, hydrated } = useCart();
  if (!hydrated || itemCount === 0) return null;

  return (
    <div className="pointer-events-none sticky bottom-4 z-40 mt-10 sm:bottom-6">
      <div className="container-page">
        <div className="animate-rise pointer-events-auto flex items-center justify-between gap-4 rounded-full bg-night py-2 pr-2 pl-6 text-white shadow-float [animation-duration:.4s] sm:pl-6">
          <p role="status" className="min-w-0 truncate text-[15px]">
            <span className="font-semibold">
              {itemCount} item{itemCount > 1 ? "s" : ""}
            </span>
            <span className="text-night-muted"> · {formatINR(subtotal)}</span>
          </p>
          <Link href="/cart" className="btn btn-primary shrink-0">
            View cart
            <ArrowRight size={16} aria-hidden="true" className="icon-nudge" />
          </Link>
        </div>
      </div>
    </div>
  );
}
