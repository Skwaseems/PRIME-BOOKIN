import { formatINR } from "@/lib/format";

export default function PriceSummary({
  subtotal,
  deliveryTotal,
  storeCount,
  gstTotal,
  grandTotal,
}: {
  subtotal: number;
  deliveryTotal: number;
  storeCount: number;
  gstTotal: number;
  grandTotal: number;
}) {
  const rows = [
    ["Subtotal", subtotal],
    [`Delivery (${storeCount} store${storeCount === 1 ? "" : "s"})`, deliveryTotal],
    ["GST (5%)", gstTotal],
  ] as const;

  return (
    <dl className="flex flex-col gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-muted">{label}</dt>
          <dd className="tabular-nums">{formatINR(value)}</dd>
        </div>
      ))}
      <div className="mt-1 flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatINR(grandTotal)}</dd>
      </div>
    </dl>
  );
}
