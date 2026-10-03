"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Loader2, LocateFixed, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleIcon from "@/components/GoogleIcon";
import EmptyState from "@/components/EmptyState";
import PriceSummary from "@/components/PriceSummary";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import type { OrderStatus } from "@/types/order";

type PaymentMethod = "cod" | "upi" | "card" | "wallet";

const paymentOptions: { id: PaymentMethod; label: string; enabled: boolean }[] = [
  { id: "cod", label: "Cash on Delivery", enabled: true },
  { id: "upi", label: "UPI", enabled: false },
  { id: "card", label: "Card", enabled: false },
  { id: "wallet", label: "Wallet", enabled: false },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const {
    items,
    storeGroups,
    subtotal,
    deliveryTotal,
    gstTotal,
    grandTotal,
    clearCart,
    hydrated,
  } = useCart();

  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError(
          "Couldn't get your location. Please allow location access, or enter your address manually."
        );
        setLocating(false);
      }
    );
  };

  const handlePlaceOrder = async () => {
    setFormError(null);
    setSubmitted(true);

    if (!user) {
      setFormError("Please sign in with Google to place an order.");
      return;
    }
    if (!name || !phone || !addressLine || !city || !pincode) {
      setFormError("Fill in the highlighted delivery fields to continue.");
      return;
    }
    if (!db) {
      setFormError(
        "Orders can't be saved right now. Please try again later."
      );
      return;
    }

    setPlacing(true);
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        userName: name,
        userPhone: phone,
        address: { line: addressLine, city, pincode, coords },
        items,
        storeGroups: storeGroups.map((group) => ({
          storeId: group.storeId,
          storeName: group.storeName,
          subtotal: group.subtotal,
        })),
        subtotal,
        deliveryTotal,
        gstTotal,
        grandTotal,
        paymentMethod,
        status: "placed" satisfies OrderStatus,
        createdAt: serverTimestamp(),
      });
      clearCart();
      router.push(`/order/${orderRef.id}`);
    } catch {
      setFormError("We couldn't place your order. Check your connection and try again.");
    } finally {
      setPlacing(false);
    }
  };

  const fields = [
    { id: "name", label: "Full name", value: name, set: setName, autoComplete: "name", placeholder: "e.g. Waseem Shaikh" },
    { id: "phone", label: "Mobile number", value: phone, set: setPhone, autoComplete: "tel", type: "tel", inputMode: "tel", maxLength: 15, placeholder: "e.g. 98765 43210" },
    { id: "address", label: "House / street / landmark", value: addressLine, set: setAddressLine, autoComplete: "address-line1", placeholder: "e.g. 221B, Wai Road", wide: true },
    { id: "city", label: "City / town", value: city, set: setCity, autoComplete: "address-level2", placeholder: "e.g. Mahabaleshwar" },
    { id: "pincode", label: "Pincode", value: pincode, set: setPincode, autoComplete: "postal-code", inputMode: "numeric", maxLength: 6, placeholder: "e.g. 412806" },
  ] as const;

  if (!hydrated) {
    return (
      <>
        <Navbar />
        <main id="main" className="flex-1 pt-10 pb-16 sm:pt-12 sm:pb-24">
          <div className="container-page" aria-busy="true">
            <span className="sr-only">Loading checkout…</span>
            <div className="skeleton h-10 w-48" />
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="skeleton h-96 lg:col-span-2" />
              <div className="skeleton h-72" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main id="main" className="flex-1 pt-10 pb-16 sm:pt-12 sm:pb-24">
          <div className="container-page">
            <h1 className="page-title">Checkout</h1>
            <div className="mt-8">
              <EmptyState
                icon={<ShoppingBag size={20} />}
                title="Nothing to check out"
                description="Your cart is empty. Add items from any service first."
                action={
                  <Link href="/#services" className="btn btn-primary">
                    Browse services
                  </Link>
                }
              />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-10 pb-16 sm:pt-12 sm:pb-24">
        <div className="container-page">
          <Link
            href="/cart"
            className="group inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft
              size={15}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to cart
          </Link>
          <h1 className="page-title mt-3">Checkout</h1>

          {!user && (
            <div className="panel mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-[15px]">
                <span className="font-semibold">Sign in to place your order.</span>{" "}
                <span className="text-muted">
                  Your order is saved to your Google account.
                </span>
              </p>
              <button onClick={signInWithGoogle} className="btn btn-secondary">
                <GoogleIcon size={16} />
                Continue with Google
              </button>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <section aria-labelledby="address-title" className="panel p-5 sm:p-7">
                <h2 id="address-title" className="display text-xl leading-tight">
                  Delivery address
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {fields.map((field) => {
                    const invalid = submitted && !field.value.trim();
                    return (
                      <div
                        key={field.id}
                        className={`flex flex-col gap-1.5 ${"wide" in field ? "sm:col-span-2" : ""}`}
                      >
                        <label htmlFor={`checkout-${field.id}`} className="field-label">
                          {field.label}
                        </label>
                        <input
                          id={`checkout-${field.id}`}
                          required
                          aria-invalid={invalid || undefined}
                          aria-describedby={invalid ? `checkout-${field.id}-error` : undefined}
                          type={"type" in field ? field.type : "text"}
                          inputMode={"inputMode" in field ? field.inputMode : undefined}
                          maxLength={"maxLength" in field ? field.maxLength : undefined}
                          autoComplete={field.autoComplete}
                          value={field.value}
                          onChange={(e) => field.set(e.target.value)}
                          placeholder={field.placeholder}
                          className="input"
                        />
                        {invalid && (
                          <p id={`checkout-${field.id}-error`} className="text-[13px] text-danger">
                            Required
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 border-t border-border pt-5">
                  <button
                    onClick={handleUseLocation}
                    disabled={locating}
                    className="btn btn-sm btn-secondary"
                  >
                    <LocateFixed size={14} aria-hidden="true" />
                    {locating ? "Locating…" : "Use my current location"}
                  </button>
                  {locationError && (
                    <p role="alert" className="mt-2 text-sm text-danger">
                      {locationError}
                    </p>
                  )}

                  {coords && (
                    <div className="mt-3 overflow-hidden rounded-md border border-border">
                      <iframe
                        title="Delivery location preview"
                        src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
                        className="h-48 w-full"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </section>

              <section aria-labelledby="payment-title" className="panel p-5 sm:p-7">
                <fieldset>
                  <legend id="payment-title" className="display text-xl leading-tight">
                    Payment method
                  </legend>
                  <div className="mt-4 flex flex-col gap-2">
                    {paymentOptions.map((option) => {
                      const selected = paymentMethod === option.id;
                      return (
                        <label
                          key={option.id}
                          className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 text-[15px] transition-colors ${
                            selected
                              ? "border-foreground bg-surface-2"
                              : "border-border"
                          } ${
                            option.enabled
                              ? "cursor-pointer hover:bg-subtle"
                              : "cursor-not-allowed text-muted"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment"
                              className="h-[18px] w-[18px] accent-[var(--accent)]"
                              disabled={!option.enabled}
                              checked={selected}
                              onChange={() => setPaymentMethod(option.id)}
                            />
                            <span className={selected ? "font-semibold" : ""}>
                              {option.label}
                            </span>
                          </span>
                          {!option.enabled && (
                            <span className="badge bg-subtle text-muted">
                              Coming soon
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </section>
            </div>

            <aside
              aria-labelledby="checkout-summary-title"
              className="panel p-5 sm:p-6 lg:sticky lg:top-24"
            >
              <h2 id="checkout-summary-title" className="display text-xl leading-tight">
                Order summary
              </h2>
              <ul className="mt-5 flex flex-col gap-2.5 border-b border-dashed border-border-strong pb-5 text-[15px]">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {item.name}{" "}
                      <span className="text-muted">× {item.quantity}</span>
                    </span>
                    <span className="tabular-nums">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <PriceSummary
                  subtotal={subtotal}
                  deliveryTotal={deliveryTotal}
                  storeCount={storeGroups.length}
                  gstTotal={gstTotal}
                  grandTotal={grandTotal}
                />
              </div>

              {formError && (
                <p role="alert" className="alert-error mt-4">
                  {formError}
                </p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                aria-busy={placing || undefined}
                className="btn btn-lg btn-primary mt-6 w-full"
              >
                {placing && (
                  <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                )}
                {placing ? "Placing order…" : `Place order · ${formatINR(grandTotal)}`}
              </button>
              <p className="mt-3 text-center text-[13px] text-muted">
                Pay in cash when your order arrives.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
