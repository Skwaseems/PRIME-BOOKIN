/** Formats a rupee amount with Indian digit grouping, e.g. ₹1,24,000. */
export function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
