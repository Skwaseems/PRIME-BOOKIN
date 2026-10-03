import { offerings } from "@/data/catalog";
import { DELIVERY_CHARGE_PER_STORE, GST_RATE } from "@/lib/pricing";
import { formatINR } from "@/lib/format";

// A real cart built from the catalog, priced with the same rules as the
// checkout, so the hero shows exactly what the product does.
const sample = [
  { id: "cab-sedan", quantity: 1 },
  { id: "med-paracetamol", quantity: 1 },
  { id: "grocery-milk", quantity: 2 },
].flatMap(({ id, quantity }) => {
  const offering = offerings.find((o) => o.id === id);
  return offering ? [{ ...offering, quantity }] : [];
});

const itemCount = sample.reduce((sum, item) => sum + item.quantity, 0);
const storeCount = new Set(sample.map((item) => item.storeId)).size;
const subtotal = sample.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
);
const delivery = storeCount * DELIVERY_CHARGE_PER_STORE;
const gst = Math.round(subtotal * GST_RATE);
const total = subtotal + delivery + gst;

export default function HeroCart() {
  return (
    <figure
      aria-label={`Example cart: ${sample
        .map((item) => item.name)
        .join(
          ", ",
        )} from ${storeCount} local stores, ${formatINR(total)} in total`}
      className="animate-settle w-full max-w-[420px] overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface text-foreground shadow-float"
    >
      <div className="flex items-baseline justify-between border-b border-dashed border-border-strong px-5 py-4 sm:px-6 sm:pt-5">
        <span className="display text-lg tracking-[-0.01em]">Your cart</span>
        <span className="text-[13px] text-muted">
          {itemCount} items · {storeCount} stores
        </span>
      </div>

      <ul>
        {sample.map((item, index) => (
          <li
            key={item.id}
            className="animate-rise px-5 pt-4 last:pb-5 sm:px-6"
            style={{ animationDelay: `${400 + index * 150}ms` }}
          >
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              {item.storeName}
            </p>
            <p className="mt-1.5 flex justify-between gap-3 text-[15px]">
              <span className="min-w-0">
                {item.name}
                {item.quantity > 1 && ` ×${item.quantity}`}
                <span className="text-muted"> · {item.unit}</span>
              </span>
              <span className="tabular-nums">
                {formatINR(item.price * item.quantity)}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-dashed border-border-strong bg-surface-2 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
        <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-sm text-body tabular-nums">
          <dt>Subtotal</dt>
          <dd className="text-right">{formatINR(subtotal)}</dd>
          <dt>Delivery ({storeCount} stores)</dt>
          <dd className="text-right">{formatINR(delivery)}</dd>
          <dt>GST ({GST_RATE * 100}%)</dt>
          <dd className="text-right">{formatINR(gst)}</dd>
          <dt className="display mt-1 border-t border-border pt-3 text-[17px] text-foreground">
            Total
          </dt>
          <dd className="display mt-1 border-t border-border pt-3 text-right text-[17px] text-foreground">
            {formatINR(total)}
          </dd>
        </dl>
        <div
          aria-hidden="true"
          className="mt-4 flex h-[46px] items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background"
        >
          Place order · Cash on delivery
        </div>
      </div>
    </figure>
  );
}
