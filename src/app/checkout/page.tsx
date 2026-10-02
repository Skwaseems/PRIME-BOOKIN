"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { LocateFixed, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleIcon from "@/components/GoogleIcon";
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

    if (!user) {
      setFormError("Please sign in with Google to place an order.");
      return;
    }
    if (!name || !phone || !addressLine || !city || !pincode) {
      setFormError("Please fill in your full delivery address.");
      return;
    }
    if (!db) {
      setFormError(
        "Orders can't be saved yet — Firestore isn't configured for this project."
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
      setFormError("Something went wrong placing your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <p className="text-muted">
              Your cart is empty, so there&apos;s nothing to check out yet.
            </p>
            <Link
              href="/#services"
              className="mt-4 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
            >
              Browse services
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Checkout
          </h1>

          {!user && (
            <div className="card-flat mt-6 flex flex-col items-start gap-3 rounded-2xl p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Sign in with Google to place this order.
              </p>
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
              >
                <GoogleIcon size={16} />
                Continue with Google
              </button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-5 lg:col-span-2">
              <div className="card-flat rounded-2xl p-5 shadow-sm">
                <h2 className="font-display text-lg font-semibold">
                  Delivery address
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-name" className="text-xs font-medium text-muted">
                      Full name
                    </label>
                    <input
                      id="checkout-name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Waseem Shaikh"
                      className="rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-phone" className="text-xs font-medium text-muted">
                      Mobile number
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label htmlFor="checkout-address" className="text-xs font-medium text-muted">
                      House / Street / Landmark
                    </label>
                    <input
                      id="checkout-address"
                      autoComplete="address-line1"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. 221B, Wai Road"
                      className="rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-city" className="text-xs font-medium text-muted">
                      City / Town
                    </label>
                    <input
                      id="checkout-city"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mahabaleshwar"
                      className="rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-pincode" className="text-xs font-medium text-muted">
                      Pincode
                    </label>
                    <input
                      id="checkout-pincode"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 412806"
                      className="rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUseLocation}
                  disabled={locating}
                  className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent disabled:opacity-60"
                >
                  <LocateFixed size={16} />
                  {locating ? "Locating…" : "Use my current location"}
                </button>
                {locationError && (
                  <p className="mt-1 text-xs text-red-500">{locationError}</p>
                )}

                {coords && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-surface-border">
                    <iframe
                      title="Delivery location preview"
                      src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
                      className="h-48 w-full"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              <div className="card-flat rounded-2xl p-5 shadow-sm">
                <h2 className="font-display text-lg font-semibold">
                  Payment method
                </h2>
                <div className="mt-4 flex flex-col gap-2">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                        option.enabled
                          ? "cursor-pointer border-surface-border"
                          : "cursor-not-allowed border-surface-border opacity-50"
                      } ${
                        paymentMethod === option.id
                          ? "border-accent bg-accent/5"
                          : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          disabled={!option.enabled}
                          checked={paymentMethod === option.id}
                          onChange={() => setPaymentMethod(option.id)}
                        />
                        {option.label}
                      </span>
                      {!option.enabled && (
                        <span className="text-xs font-medium text-muted">
                          Coming soon
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
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
                  <span>Delivery</span>
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

              {formError && (
                <p className="mt-3 text-sm text-red-500">{formError}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="mt-5 w-full rounded-full bg-accent py-3 text-sm font-semibold text-white shadow-sm shadow-accent/30 hover:bg-accent/90 disabled:opacity-60"
              >
                {placing ? "Placing order…" : "Place order"}
              </button>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck size={13} />
                Your order is saved securely to your account.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
