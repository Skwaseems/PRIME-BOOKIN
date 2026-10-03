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

  const storeWord = storeGroups.length === 1 ? "store" : "stores";

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-10 pb-16 sm:pt-12 sm:pb-24">
        <div className="container-page">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="page-title">Cart</h1>
            {hydrated && itemCount > 0 && (
              <p className="text-[15px] text-muted">
                {itemCount} item{itemCount > 1 ? "s" : ""} from{" "}
                {storeGroups.length} {storeWord}
              </p>
            )}
          </div>

          {!hydrated ? (
            <div aria-busy="true" className="mt-9 grid gap-6 lg:grid-cols-3">
              <span className="sr-only">Loading cart…</span>
              <div className="skeleton h-72 lg:col-span-2" />
              <div className="skeleton h-72" />
            </div>
          ) : itemCount === 0 ? (
            <div className="mt-9">
              <EmptyState
                icon={<ShoppingBag size={22} strokeWidth={1.75} />}
                title="Your cart is empty"
                description="Add a cab, a hotel stay, medicines or groceries to get started."
                action={
                  <Link href="/#services" className="btn btn-lg btn-primary">
                    Browse services
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-9 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-4 lg:col-span-2">
                {storeGroups.map((group) => (
                  <section
                    key={group.storeId}
                    aria-labelledby={`store-${group.storeId}`}
                    className="panel overflow-hidden"
                  >
                    <header className="panel-header">
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
                          className="grid grid-cols-[minmax(0,1fr)_auto_44px] items-center gap-x-3 gap-y-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_88px_44px] sm:gap-x-4 sm:px-6"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold">{item.name}</p>
                            <p className="mt-0.5 text-sm text-muted">
                              {formatINR(item.price)} / {item.unit}
                              <span className="sm:hidden">
                                {" · "}
                                <span className="font-medium text-foreground tabular-nums">
                                  {formatINR(item.price * item.quantity)}
                                </span>
                              </span>
                            </p>
                          </div>
                          <QuantityStepper
                            quantity={item.quantity}
                            onChange={(q) => updateQuantity(item.id, q)}
                            itemName={item.name}
                          />
                          <span className="hidden text-right font-semibold tabular-nums sm:block">
                            {formatINR(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="btn btn-icon btn-ghost hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 size={17} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              <aside
                aria-labelledby="summary-title"
                className="panel p-5 sm:p-6 lg:sticky lg:top-24"
              >
                <h2 id="summary-title" className="display text-xl leading-tight">
                  Order summary
                </h2>
                <div className="mt-5">
                  <PriceSummary
                    subtotal={subtotal}
                    deliveryTotal={deliveryTotal}
                    storeCount={storeGroups.length}
                    gstTotal={gstTotal}
                    grandTotal={grandTotal}
                  />
                </div>
                <Link href="/checkout" className="btn btn-lg btn-primary mt-6 w-full">
                  Continue to checkout
                  <ArrowRight size={16} aria-hidden="true" className="icon-nudge" />
                </Link>
                <Link href="/#services" className="btn btn-ghost mt-2 w-full">
                  Keep shopping
                </Link>
                <p className="mt-4 border-t border-dashed border-border-strong pt-4 text-[13px] leading-normal text-muted">
                  Cash on delivery. Each store receives only its part of the
                  order.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
