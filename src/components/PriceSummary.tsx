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
    <dl className="flex flex-col gap-3 text-[15px]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-body">{label}</dt>
          <dd className="tabular-nums">{formatINR(value)}</dd>
        </div>
      ))}
      <div className="display mt-1 flex justify-between gap-4 border-t border-border pt-4 text-xl leading-none">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatINR(grandTotal)}</dd>
      </div>
    </dl>
  );
}
