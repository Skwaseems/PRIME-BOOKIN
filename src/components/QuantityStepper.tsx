"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({
  quantity,
  onChange,
  itemName,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  itemName: string;
}) {
  return (
    <div
      role="group"
      aria-label={`Quantity of ${itemName}`}
      className="inline-flex h-9 items-center rounded-md border border-border bg-surface"
    >
      <button
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? `Remove ${itemName}` : `Decrease ${itemName}`}
        className="flex h-full w-9 items-center justify-center rounded-l-md text-muted hover:bg-subtle hover:text-foreground"
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 text-center text-sm font-medium tabular-nums"
      >
        {quantity}
      </span>
      <button
        onClick={() => onChange(quantity + 1)}
        aria-label={`Increase ${itemName}`}
        className="flex h-full w-9 items-center justify-center rounded-r-md text-muted hover:bg-subtle hover:text-foreground"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
