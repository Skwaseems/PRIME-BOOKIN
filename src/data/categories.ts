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
  gradient: string;
};

export const categories: Category[] = [
  {
    slug: "cabs",
    icon: Car,
    emoji: "🚕",
    title: "Cab Booking",
    description: "Ride across town with upfront fares and live tracking.",
    gradient: "from-red-500 to-orange-500",
  },
  {
    slug: "hotels",
    icon: BedDouble,
    emoji: "🏨",
    title: "Hotel Booking",
    description: "Handpicked stays nearby, booked in a couple of taps.",
    gradient: "from-amber-500 to-red-500",
  },
  {
    slug: "food",
    icon: UtensilsCrossed,
    emoji: "🍔",
    title: "Food & Cafe",
    description: "Order from local restaurants and neighbourhood cafes.",
    gradient: "from-rose-500 to-red-600",
  },
  {
    slug: "medical",
    icon: Pill,
    emoji: "💊",
    title: "Medical Store",
    description: "Medicines delivered fast from verified pharmacies.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    slug: "grocery",
    icon: ShoppingBasket,
    emoji: "🛒",
    title: "Grocery",
    description: "Daily essentials from the grocer down the street.",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    slug: "other",
    icon: Store,
    emoji: "📦",
    title: "Other Local Shops",
    description: "Stationery, gifts and more from local businesses.",
    gradient: "from-indigo-500 to-purple-500",
  },
];
