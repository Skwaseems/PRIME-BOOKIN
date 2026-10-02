"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import type { OrderDoc } from "@/types/order";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!db) {
        setError("Firestore isn't configured for this project.");
        setLoading(false);
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, "orders", orderId));
        if (!snapshot.exists()) {
          setError("We couldn't find this order.");
        } else {
          setOrder(snapshot.data() as OrderDoc);
        }
      } catch {
        setError(
          "Couldn't load this order. You may not have permission to view it."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          {loading && <p className="text-center text-muted">Loading order…</p>}

          {!loading && error && (
            <div className="card-flat flex flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-sm">
              <XCircle size={36} className="text-accent" />
              <p className="text-muted">{error}</p>
              <Link
                href="/"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
              >
                Back home
              </Link>
            </div>
          )}

          {!loading && order && (
            <div className="card-flat rounded-2xl p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 size={44} className="text-emerald-500" />
                <h1 className="font-display mt-3 text-2xl font-bold">
                  Order placed!
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Order ID: <span className="font-mono">{orderId}</span>
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-4 divide-y divide-surface-border">
                {order.storeGroups.map((group) => (
                  <div key={group.storeId} className="pt-4 first:pt-0">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{group.storeName}</span>
                      <span>₹{group.subtotal}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-surface-border pt-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span>₹{order.deliveryTotal}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST</span>
                  <span>₹{order.gstTotal}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Grand total</span>
                  <span>₹{order.grandTotal}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-accent/5 p-4 text-sm">
                <p className="font-semibold">
                  Delivering to {order.userName}
                </p>
                <p className="text-muted">
                  {order.address.line}, {order.address.city} —{" "}
                  {order.address.pincode}
                </p>
                <p className="mt-1 text-muted">
                  Payment:{" "}
                  <span className="font-medium text-foreground">
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : order.paymentMethod}
                  </span>
                </p>
              </div>

              <p className="mt-4 text-center text-xs text-muted">
                WhatsApp notifications to the store and our team are coming in
                a later phase — for now, track this order from your account.
              </p>

              <Link
                href="/"
                className="mt-6 block rounded-full bg-accent py-3 text-center text-sm font-semibold text-white hover:bg-accent/90"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
