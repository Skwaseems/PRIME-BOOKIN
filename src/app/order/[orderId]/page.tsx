"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle2, SearchX } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import PriceSummary from "@/components/PriceSummary";
import StatusBadge, { paymentLabel } from "@/components/StatusBadge";
import { db } from "@/lib/firebase";
import { formatINR } from "@/lib/format";
import type { OrderDoc } from "@/types/order";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ title: string; detail: string } | null>(
    null
  );

  useEffect(() => {
    async function fetchOrder() {
      if (!db) {
        setError({
          title: "Orders are unavailable",
          detail: "We can't load orders right now. Please try again later.",
        });
        setLoading(false);
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, "orders", orderId));
        if (!snapshot.exists()) {
          setError({
            title: "Order not found",
            detail: "Check the link, or place a new order from your cart.",
          });
        } else {
          setOrder(snapshot.data() as OrderDoc);
        }
      } catch {
        setError({
          title: "We couldn't load this order",
          detail:
            "Make sure you're signed in with the account that placed it, then try again.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 py-8 sm:py-10">
        <div className="container-page max-w-3xl">
          {loading && (
            <div aria-busy="true" aria-live="polite" className="flex flex-col gap-4">
              <span className="sr-only">Loading order…</span>
              <div className="h-8 w-56 animate-pulse rounded-md bg-subtle" />
              <div className="h-64 animate-pulse rounded-lg bg-subtle" />
            </div>
          )}

          {!loading && error && (
            <EmptyState
              tone="danger"
              icon={<SearchX size={20} />}
              title={error.title}
              description={error.detail}
              action={
                <Link href="/" className="btn btn-secondary">
                  Go to home
                </Link>
              }
            />
          )}

          {!loading && order && (
            <>
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={28}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-success"
                />
                <div>
                  <h1 className="page-title">Order placed</h1>
                  <p className="mt-1 text-muted">
                    Thanks, {order.userName.split(" ")[0]}. Your order has been
                    sent to {order.storeGroups.length} store
                    {order.storeGroups.length > 1 ? "s" : ""}.
                  </p>
                </div>
              </div>

              <dl className="panel mt-6 grid grid-cols-2 gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-muted">Order ID</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs">{orderId}</dd>
                </div>
                <div>
                  <dt className="text-muted">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={order.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Payment</dt>
                  <dd className="mt-0.5 font-medium">
                    {paymentLabel(order.paymentMethod)}
                  </dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-muted">Total</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatINR(order.grandTotal)}
                  </dd>
                </div>
              </dl>

              <section aria-labelledby="items-title" className="panel mt-4">
                <h2
                  id="items-title"
                  className="section-title border-b border-border px-5 py-3"
                >
                  Items
                </h2>
                {order.storeGroups.map((group) => (
                  <div
                    key={group.storeId}
                    className="border-b border-border px-5 py-4 last:border-b-0"
                  >
                    <p className="eyebrow">{group.storeName}</p>
                    <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                      {order.items
                        .filter((item) => item.storeId === group.storeId)
                        .map((item) => (
                          <li key={item.id} className="flex justify-between gap-4">
                            <span>
                              {item.name}{" "}
                              <span className="text-muted">× {item.quantity}</span>
                            </span>
                            <span className="tabular-nums">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
                <div className="border-t border-border px-5 py-4">
                  <PriceSummary
                    subtotal={order.subtotal}
                    deliveryTotal={order.deliveryTotal}
                    storeCount={order.storeGroups.length}
                    gstTotal={order.gstTotal}
                    grandTotal={order.grandTotal}
                  />
                </div>
              </section>

              <section aria-labelledby="delivery-title" className="panel mt-4 p-5 text-sm">
                <h2 id="delivery-title" className="section-title">
                  Delivery
                </h2>
                <p className="mt-2 font-medium">{order.userName}</p>
                <p className="text-muted">
                  {order.address.line}, {order.address.city} {order.address.pincode}
                </p>
                <p className="text-muted">{order.userPhone}</p>
              </section>

              <p className="mt-4 text-sm text-muted">
                Keep your order ID for reference. Pay{" "}
                {formatINR(order.grandTotal)} in cash when your order arrives.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href="/#services" className="btn btn-primary">
                  Continue shopping
                </Link>
                <Link href="/" className="btn btn-secondary">
                  Go to home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
