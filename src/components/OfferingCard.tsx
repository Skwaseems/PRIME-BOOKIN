"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Offering } from "@/data/catalog";

export default function OfferingCard({ offering }: { offering: Offering }) {
  const { items, addItem, updateQuantity } = useCart();
  const inCart = items.find((item) => item.id === offering.id);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addItem(offering);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div className="card-flat flex flex-col rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xl">
          {offering.emoji}
        </div>
        <span className="text-xs font-medium text-muted">
          {offering.storeName}
        </span>
      </div>

      <h3 className="font-display mt-3 text-base font-semibold">
        {offering.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{offering.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-bold">₹{offering.price}</p>
          <p className="text-xs text-muted">{offering.unit}</p>
        </div>

        {!inCart ? (
          <button
            onClick={handleAdd}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              justAdded
                ? "bg-emerald-500 text-white"
                : "bg-accent text-white hover:bg-accent/90"
            }`}
          >
            {justAdded ? "Added" : "Add"}
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-full border border-surface-border px-1 py-1">
            <button
              onClick={() => updateQuantity(offering.id, inCart.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-foreground hover:bg-surface-border"
            >
              <Minus size={14} />
            </button>
            <span className="w-4 text-center text-sm font-semibold">
              {inCart.quantity}
            </span>
            <button
              onClick={() => updateQuantity(offering.id, inCart.quantity + 1)}
              aria-label="Increase quantity"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
