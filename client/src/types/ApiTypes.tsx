// Shapes returned by the Primebookin API (server/src/models).

export type ServiceKey = 'stay' | 'food' | 'medicine' | 'cab';
export type PartnerTypeKey = 'hotel' | 'restaurant' | 'pharmacy' | 'cab' | 'delivery';

export type ApiUser = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'partner' | 'admin';
  location?: string;
  addresses?: {label?: string; line: string; city?: string; pincode?: string}[];
  wishlist?: string[];
};

export type ApiPartner = {
  _id: string;
  type: PartnerTypeKey;
  service: ServiceKey | null;
  businessName: string;
  description?: string;
  phone?: string;
  address?: string;
  city?: string;
  mapUrl?: string;
  image?: string;
  location?: {lat: number; lng: number};
  vehicle?: {type: string; number: string; model?: string};
  online?: boolean;
  lastLocation?: {lat: number; lng: number; at: string};
  prepTimeMin?: number;
  documents?: {label: string; number?: string; hasFile: boolean; uploadedAt: string}[];
  termsAcceptedAt?: string;
  owner?: string | {_id: string; name: string; phone: string; email?: string};
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  statusNote?: string;
  isOpen: boolean;
  rating: number;
  createdAt?: string;
};

export type ApiListing = {
  _id: string;
  partner: ApiPartner | string;
  service: ServiceKey;
  name: string;
  description?: string;
  category?: string;
  price: number;
  priceUnit: 'item' | 'night' | 'trip' | 'day';
  images: string[];
  details: Record<string, any>;
  tags: string[];
  isAvailable: boolean;
  rating: number;
};
