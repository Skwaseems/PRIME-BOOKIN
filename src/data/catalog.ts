export type ServiceCategorySlug =
  | "cabs"
  | "hotels"
  | "food"
  | "medical"
  | "grocery"
  | "other";

export type Offering = {
  id: string;
  name: string;
  unit: string;
  price: number;
  emoji: string;
  storeId: string;
  storeName: string;
  category: ServiceCategorySlug;
  description: string;
};

export const categoryMeta: Record<
  ServiceCategorySlug,
  { title: string; subtitle: string }
> = {
  cabs: {
    title: "Cab Booking",
    subtitle: "Pick a ride type — added to your cart as a booking.",
  },
  hotels: {
    title: "Hotel Booking",
    subtitle: "Reserve a room for tonight, added to your cart instantly.",
  },
  food: {
    title: "Food & Cafe",
    subtitle: "Order from local restaurants and neighbourhood cafes.",
  },
  medical: {
    title: "Medical Store",
    subtitle: "Everyday medicines from verified local pharmacies.",
  },
  grocery: {
    title: "Grocery",
    subtitle: "Daily essentials from the grocer down the street.",
  },
  other: {
    title: "Other Local Shops",
    subtitle: "Stationery, gifts and more from local businesses.",
  },
};

export const offerings: Offering[] = [
  // Cabs — priced as an estimated fare for the ride
  {
    id: "cab-hatchback",
    name: "Hatchback",
    unit: "up to 5 km",
    price: 129,
    emoji: "🚗",
    storeId: "prime-cabs",
    storeName: "Prime Cabs",
    category: "cabs",
    description: "Budget-friendly ride for up to 4 people.",
  },
  {
    id: "cab-sedan",
    name: "Sedan",
    unit: "up to 5 km",
    price: 179,
    emoji: "🚙",
    storeId: "prime-cabs",
    storeName: "Prime Cabs",
    category: "cabs",
    description: "Comfortable ride with extra legroom.",
  },
  {
    id: "cab-suv",
    name: "SUV",
    unit: "up to 5 km",
    price: 249,
    emoji: "🚐",
    storeId: "prime-cabs",
    storeName: "Prime Cabs",
    category: "cabs",
    description: "Spacious ride for up to 6 people with luggage.",
  },

  // Hotels — priced per night
  {
    id: "hotel-suraj-deluxe",
    name: "Hotel Suraj — Deluxe Room",
    unit: "per night",
    price: 2199,
    emoji: "🏨",
    storeId: "hotel-suraj",
    storeName: "Hotel Suraj",
    category: "hotels",
    description: "Valley-facing deluxe room with breakfast included.",
  },
  {
    id: "hotel-suraj-suite",
    name: "Hotel Suraj — Family Suite",
    unit: "per night",
    price: 3499,
    emoji: "🛏️",
    storeId: "hotel-suraj",
    storeName: "Hotel Suraj",
    category: "hotels",
    description: "Two-room suite, ideal for families of 4.",
  },
  {
    id: "villa-greenridge",
    name: "Green Ridge Villa",
    unit: "per night",
    price: 5999,
    emoji: "🏡",
    storeId: "green-ridge-villa",
    storeName: "Green Ridge Villa",
    category: "hotels",
    description: "Private 2BHK villa with a strawberry-garden view.",
  },

  // Food & Cafe
  {
    id: "cafe-cold-coffee",
    name: "Cold Coffee",
    unit: "1 glass",
    price: 120,
    emoji: "🥤",
    storeId: "brew-cafe",
    storeName: "Brew Cafe",
    category: "food",
    description: "Chilled cold coffee topped with ice cream.",
  },
  {
    id: "cafe-sandwich",
    name: "Veg Grilled Sandwich",
    unit: "1 plate",
    price: 140,
    emoji: "🥪",
    storeId: "brew-cafe",
    storeName: "Brew Cafe",
    category: "food",
    description: "Grilled sandwich with cheese and veggies.",
  },
  {
    id: "food-thali",
    name: "Veg Thali",
    unit: "1 plate",
    price: 180,
    emoji: "🍛",
    storeId: "maharaja-restaurant",
    storeName: "Maharaja Restaurant",
    category: "food",
    description: "Full course thali with dal, sabzi, rice and roti.",
  },

  // Medical
  {
    id: "med-paracetamol",
    name: "Paracetamol 650mg",
    unit: "strip of 10",
    price: 35,
    emoji: "💊",
    storeId: "city-pharmacy",
    storeName: "City Pharmacy",
    category: "medical",
    description: "Fever and pain relief tablets.",
  },
  {
    id: "med-cough-syrup",
    name: "Cough Syrup",
    unit: "100 ml bottle",
    price: 95,
    emoji: "🧴",
    storeId: "city-pharmacy",
    storeName: "City Pharmacy",
    category: "medical",
    description: "For dry and wet cough relief.",
  },
  {
    id: "med-bandage",
    name: "Adhesive Bandages",
    unit: "pack of 20",
    price: 60,
    emoji: "🩹",
    storeId: "city-pharmacy",
    storeName: "City Pharmacy",
    category: "medical",
    description: "Waterproof adhesive bandages, assorted sizes.",
  },

  // Grocery
  {
    id: "grocery-milk",
    name: "Toned Milk",
    unit: "1 litre",
    price: 58,
    emoji: "🥛",
    storeId: "daily-needs-grocery",
    storeName: "Daily Needs Grocery",
    category: "grocery",
    description: "Fresh toned milk, delivered chilled.",
  },
  {
    id: "grocery-bread",
    name: "Brown Bread",
    unit: "1 pack",
    price: 48,
    emoji: "🍞",
    storeId: "daily-needs-grocery",
    storeName: "Daily Needs Grocery",
    category: "grocery",
    description: "Whole wheat brown bread, 400g.",
  },
  {
    id: "grocery-eggs",
    name: "Farm Eggs",
    unit: "tray of 12",
    price: 90,
    emoji: "🥚",
    storeId: "daily-needs-grocery",
    storeName: "Daily Needs Grocery",
    category: "grocery",
    description: "Farm-fresh brown eggs.",
  },

  // Other local shops
  {
    id: "other-notebook",
    name: "Ruled Notebook",
    unit: "200 pages",
    price: 45,
    emoji: "📓",
    storeId: "city-stationers",
    storeName: "City Stationers",
    category: "other",
    description: "A5 ruled notebook, hardbound cover.",
  },
  {
    id: "other-giftwrap",
    name: "Gift Wrap & Card",
    unit: "1 set",
    price: 99,
    emoji: "🎁",
    storeId: "city-stationers",
    storeName: "City Stationers",
    category: "other",
    description: "Premium gift wrap sheet with a greeting card.",
  },
];

export function getOfferingsByCategory(category: ServiceCategorySlug) {
  return offerings.filter((offering) => offering.category === category);
}
