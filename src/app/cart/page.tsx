"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import PriceSummary from "@/components/PriceSummary";
import QuantityStepper from "@/components/QuantityStepper";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const {
    storeGroups,
    itemCount,
    subtotal,
    deliveryTotal,
    gstTotal,
    grandTotal,
    updateQuantity,
    removeItem,
    hydrated,
  } = useCart();

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 py-8 sm:py-10">
        <div className="container-page">
          <h1 className="page-title">Cart</h1>
          {itemCount > 0 && (
            <p className="mt-1 text-muted">
              {itemCount} item{itemCount > 1 ? "s" : ""} from{" "}
              {storeGroups.length} store{storeGroups.length > 1 ? "s" : ""}
            </p>
          )}

          {!hydrated ? (
            <div aria-busy="true" className="mt-8 h-64 animate-pulse rounded-lg bg-subtle">
              <span className="sr-only">Loading cart…</span>
            </div>
          ) : itemCount === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={<ShoppingBag size={20} />}
                title="Your cart is empty"
                description="Add a cab, a hotel stay, medicines or groceries to get started."
                action={
                  <Link href="/#services" className="btn btn-primary">
                    Browse services
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-4 lg:col-span-2">
                {storeGroups.map((group) => (
                  <section
                    key={group.storeId}
                    aria-labelledby={`store-${group.storeId}`}
                    className="panel"
                  >
                    <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
                      <h2 id={`store-${group.storeId}`} className="section-title">
                        {group.storeName}
                      </h2>
                      <span className="text-sm text-muted tabular-nums">
                        {formatINR(group.subtotal)}
                      </span>
                    </header>

                    <ul className="divide-y divide-border">
                      {group.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4"
                        >
                          <span
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-subtle text-lg"
                          >
                            {item.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted">
                              {formatINR(item.price)} / {item.unit}
                            </p>
                          </div>

                          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                            <QuantityStepper
                              quantity={item.quantity}
                              onChange={(q) => updateQuantity(item.id, q)}
                              itemName={item.name}
                            />
                            <span className="w-20 text-right font-medium tabular-nums">
                              {formatINR(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="btn btn-icon btn-ghost h-9 w-9"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              <aside
                aria-labelledby="summary-title"
                className="panel p-5 lg:sticky lg:top-24"
              >
                <h2 id="summary-title" className="section-title">
                  Order summary
                </h2>
                <div className="mt-4">
                  <PriceSummary
                    subtotal={subtotal}
                    deliveryTotal={deliveryTotal}
                    storeCount={storeGroups.length}
                    gstTotal={gstTotal}
                    grandTotal={grandTotal}
                  />
                </div>
                <Link href="/checkout" className="btn btn-lg btn-primary mt-5 w-full">
                  Continue to checkout
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="/#services"
                  className="btn btn-ghost mt-2 w-full"
                >
                  Keep shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
