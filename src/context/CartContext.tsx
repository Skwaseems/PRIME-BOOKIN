"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Offering } from "@/data/catalog";
import { DELIVERY_CHARGE_PER_STORE, GST_RATE } from "@/lib/pricing";

export type CartItem = {
  id: string;
  name: string;
  unit: string;
  price: number;
  emoji: string;
  storeId: string;
  storeName: string;
  quantity: number;
};

export type StoreGroup = {
  storeId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
};

const STORAGE_KEY = "primebookin.cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (offering: Offering, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  /** False until the saved cart has been read from localStorage. */
  hydrated: boolean;
  storeGroups: StoreGroup[];
  itemCount: number;
  subtotal: number;
  deliveryTotal: number;
  gstTotal: number;
  grandTotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Start empty on both server and client so hydration matches, then load the
  // saved cart after mount.
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Merge rather than replace, in case an item was added before this ran.
    const saved = loadCart();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring persisted cart after hydration
    setItems((current) => [
      ...saved.filter((s) => !current.some((c) => c.id === s.id)),
      ...current,
    ]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (offering: Offering, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === offering.id);
      if (existing) {
        return prev.map((item) =>
          item.id === offering.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: offering.id,
          name: offering.name,
          unit: offering.unit,
          price: offering.price,
          emoji: offering.emoji,
          storeId: offering.storeId,
          storeName: offering.storeName,
          quantity,
        },
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const storeGroups = useMemo<StoreGroup[]>(() => {
    const groups = new Map<string, StoreGroup>();
    for (const item of items) {
      const group = groups.get(item.storeId);
      const lineTotal = item.price * item.quantity;
      if (group) {
        group.items.push(item);
        group.subtotal += lineTotal;
      } else {
        groups.set(item.storeId, {
          storeId: item.storeId,
          storeName: item.storeName,
          items: [item],
          subtotal: lineTotal,
        });
      }
    }
    return Array.from(groups.values());
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = storeGroups.reduce((sum, group) => sum + group.subtotal, 0);
  const deliveryTotal = storeGroups.length * DELIVERY_CHARGE_PER_STORE;
  const gstTotal = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + deliveryTotal + gstTotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        hydrated,
        storeGroups,
        itemCount,
        subtotal,
        deliveryTotal,
        gstTotal,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
