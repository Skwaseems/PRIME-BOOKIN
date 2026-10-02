import type { Timestamp } from "firebase/firestore";
import type { CartItem, StoreGroup } from "@/context/CartContext";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const orderStatuses: OrderStatus[] = [
  "placed",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export type OrderAddress = {
  line: string;
  city: string;
  pincode: string;
  coords: { lat: number; lng: number } | null;
};

export type OrderDoc = {
  userId: string;
  userEmail: string | null;
  userName: string;
  userPhone: string;
  address: OrderAddress;
  items: CartItem[];
  storeGroups: Pick<StoreGroup, "storeId" | "storeName" | "subtotal">[];
  subtotal: number;
  deliveryTotal: number;
  gstTotal: number;
  grandTotal: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: Timestamp | null;
};

export type Order = OrderDoc & { id: string };
