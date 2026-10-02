"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import QuantityStepper from "@/components/QuantityStepper";
import { formatINR } from "@/lib/format";
import type { Offering } from "@/data/catalog";

export default function OfferingCard({ offering }: { offering: Offering }) {
  const { items, addItem, updateQuantity } = useCart();
  const inCart = items.find((item) => item.id === offering.id);

  return (
    <article className="panel flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-subtle text-xl"
        >
          {offering.emoji}
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold leading-snug">{offering.name}</h2>
          <p className="text-xs text-muted">{offering.storeName}</p>
        </div>
      </div>

      <p className="mt-3 flex-1 text-sm text-muted">{offering.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p>
          <span className="font-semibold tabular-nums">
            {formatINR(offering.price)}
          </span>
          <span className="text-xs text-muted"> / {offering.unit}</span>
        </p>

        {inCart ? (
          <QuantityStepper
            quantity={inCart.quantity}
            onChange={(q) => updateQuantity(offering.id, q)}
            itemName={offering.name}
          />
        ) : (
          <button
            onClick={() => addItem(offering)}
            aria-label={`Add ${offering.name} to cart`}
            className="btn btn-sm btn-secondary h-9"
          >
            <Plus size={14} aria-hidden="true" />
            Add
          </button>
        )}
      </div>
    </article>
  );
}
