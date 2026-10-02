import type { LucideIcon } from "lucide-react";
import {
  Car,
  BedDouble,
  UtensilsCrossed,
  Pill,
  ShoppingBasket,
  Store,
} from "lucide-react";

export type Category = {
  slug: string;
  icon: LucideIcon;
  emoji: string;
  title: string;
  description: string;
};

export const categories: Category[] = [
  {
    slug: "cabs",
    icon: Car,
    emoji: "🚕",
    title: "Cab Booking",
    description: "Ride across town with upfront fares and live tracking.",
  },
  {
    slug: "hotels",
    icon: BedDouble,
    emoji: "🏨",
    title: "Hotel Booking",
    description: "Handpicked stays nearby, booked in a couple of taps.",
  },
  {
    slug: "food",
    icon: UtensilsCrossed,
    emoji: "🍔",
    title: "Food & Cafe",
    description: "Order from local restaurants and neighbourhood cafes.",
  },
  {
    slug: "medical",
    icon: Pill,
    emoji: "💊",
    title: "Medical Store",
    description: "Medicines delivered fast from verified pharmacies.",
  },
  {
    slug: "grocery",
    icon: ShoppingBasket,
    emoji: "🛒",
    title: "Grocery",
    description: "Daily essentials from the grocer down the street.",
  },
  {
    slug: "other",
    icon: Store,
    emoji: "📦",
    title: "Other Local Shops",
    description: "Stationery, gifts and more from local businesses.",
  },
];
