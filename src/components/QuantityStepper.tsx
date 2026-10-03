"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({
  quantity,
  onChange,
  itemName,
  tone = "outline",
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  itemName: string;
  /** "solid" is the just-added state on listings; "outline" sits in the cart. */
  tone?: "outline" | "solid";
}) {
  const solid = tone === "solid";
  const button = `flex h-full w-11 cursor-pointer items-center justify-center rounded-lg transition-colors ${
    solid
      ? "text-background hover:bg-background/15"
      : "text-muted hover:bg-subtle hover:text-foreground"
  }`;

  return (
    <div
      role="group"
      aria-label={`Quantity of ${itemName}`}
      className={`inline-flex h-11 items-center rounded-lg ${
        solid
          ? "bg-foreground text-background"
          : "border border-border-strong bg-surface"
      }`}
    >
      <button
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? `Remove ${itemName}` : `Decrease ${itemName}`}
        className={button}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-7 text-center text-[15px] font-semibold tabular-nums"
      >
        {quantity}
      </span>
      <button
        onClick={() => onChange(quantity + 1)}
        aria-label={`Increase ${itemName}`}
        className={button}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
