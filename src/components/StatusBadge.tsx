import type { OrderStatus } from "@/types/order";

export const statusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Each pair meets WCAG AA in both themes.
const statusStyles: Record<OrderStatus, string> = {
  placed: "bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300",
  confirmed: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  out_for_delivery:
    "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-300",
  delivered:
    "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300",
  cancelled: "bg-subtle text-muted",
};

export function paymentLabel(method: string) {
  return method === "cod" ? "Cash on delivery" : method.toUpperCase();
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`badge ${statusStyles[status]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
