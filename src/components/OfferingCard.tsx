"use client";

import { Plus, Store } from "lucide-react";
import { categories } from "@/data/categories";
import { useCart } from "@/context/CartContext";
import QuantityStepper from "@/components/QuantityStepper";
import { formatINR } from "@/lib/format";
import type { Offering } from "@/data/catalog";

export default function OfferingCard({ offering }: { offering: Offering }) {
  const Icon =
    categories.find((category) => category.slug === offering.category)?.icon ?? Store;
  const { items, addItem, updateQuantity } = useCart();
  const inCart = items.find((item) => item.id === offering.id);

  return (
    <article className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 border-t border-border px-4 py-5 transition-colors first:border-t-0 hover:bg-surface-2 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:gap-x-5 sm:px-6 sm:py-6">
      <span
        aria-hidden="true"
        className="flex aspect-square items-center justify-center rounded-xl bg-subtle text-accent-ink"
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <h3 className="display text-lg leading-snug tracking-[-0.01em] sm:text-[19px]">
          {offering.name}
        </h3>
        <p className="mt-1 text-[15px] leading-normal text-body">
          {offering.description}
        </p>
        <p className="mt-1.5 text-sm text-muted">
          <span className="font-semibold text-foreground tabular-nums">
            {formatINR(offering.price)}
          </span>{" "}
          / {offering.unit}
        </p>
      </div>

      <div className="col-span-2 flex justify-end sm:col-span-1">
        {inCart ? (
          <QuantityStepper
            quantity={inCart.quantity}
            onChange={(q) => updateQuantity(offering.id, q)}
            itemName={offering.name}
            tone="solid"
          />
        ) : (
          <button
            onClick={() => addItem(offering)}
            aria-label={`Add ${offering.name} to cart`}
            className="btn btn-secondary w-full hover:border-accent hover:text-accent-ink sm:w-auto"
          >
            <Plus size={16} aria-hidden="true" />
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}
