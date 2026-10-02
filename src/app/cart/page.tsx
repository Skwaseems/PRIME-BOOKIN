"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

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
  } = useCart();

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your cart
          </h1>

          {itemCount === 0 ? (
            <div className="card-flat mt-8 flex flex-col items-center gap-4 rounded-2xl p-12 text-center shadow-sm">
              <ShoppingBag size={40} className="text-muted" />
              <p className="text-muted">
                Your cart is empty. Add a cab, a hotel stay, medicines or
                groceries to get started.
              </p>
              <Link
                href="/#services"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
              >
                Browse services
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-5 lg:col-span-2">
                {storeGroups.map((group) => (
                  <div
                    key={group.storeId}
                    className="card-flat rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-semibold">
                        {group.storeName}
                      </h2>
                      <span className="text-sm text-muted">
                        Subtotal ₹{group.subtotal}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col divide-y divide-surface-border">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-lg">
                              {item.emoji}
                            </span>
                            <div>
                              <p className="text-sm font-semibold">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted">
                                {item.unit} · ₹{item.price}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-full border border-surface-border px-1 py-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                aria-label="Decrease quantity"
                                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-border"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-4 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                aria-label="Increase quantity"
                                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-border"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                              className="text-muted hover:text-accent"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-flat h-fit rounded-2xl p-5 shadow-sm">
                <h2 className="font-display text-lg font-semibold">
                  Order summary
                </h2>
                <div className="mt-4 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Delivery ({storeGroups.length} store{storeGroups.length > 1 ? "s" : ""})</span>
                    <span>₹{deliveryTotal}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>GST (5%)</span>
                    <span>₹{gstTotal}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-surface-border pt-3 text-base font-bold">
                    <span>Grand total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-semibold text-white shadow-sm shadow-accent/30 hover:bg-accent/90"
                >
                  Proceed to checkout
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
