import {api, API_URL} from '../api';
import type {ApiListing, ApiPartner, ServiceKey} from '../types/ApiTypes';

export type EnquiryType = 'basket' | 'stay' | 'medicine' | 'cab' | 'food-custom';

export type Place = {label: string; address?: string; lat: number; lng: number};

export type EnquiryStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivered'
  | 'confirmed'
  | 'checked_in'
  | 'arrived'
  | 'started'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'closed';

export type RiderStage = 'assigned' | 'at_store' | 'picked_up' | 'at_customer' | 'delivered';

type PartnerRef = {_id: string; businessName: string; phone?: string; address?: string; vehicle?: {type: string; number: string; model?: string}};

export type Enquiry = {
  _id: string;
  code: string;
  type: EnquiryType;
  customerName?: string;
  contactPhone?: string;
  address?: string;
  location?: Place;
  items: {listing: string; name: string; service: ServiceKey; price: number; quantity: number; partnerName?: string}[];
  text?: string;
  hasImage?: boolean;
  stay?: {
    name: string;
    roomType: string;
    rooms: number;
    guests: number;
    extraBeds: number;
    guestNames: string[];
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  cab?: {
    pickup: Place;
    drop: Place;
    vehicle: string;
    distanceKm: number;
    durationMin: number;
    approximate: boolean;
  };
  partner?: PartnerRef | null;
  rider?: PartnerRef | null;
  driver?: PartnerRef | null;
  riderStage?: RiderStage;
  distanceKm?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: EnquiryStatus;
  statusNote?: string;
  timeline: {status: string; at: string; by?: string}[];
  otp?: string;
  anonymizedAt?: string;
  createdAt: string;
};

export type Customer = {customerName: string; phone: string; consent: true};
export type DeliveryTo = Customer & {address: string; location: Place};

export type StayBooking = {
  listing: string;
  roomType: string;
  rooms: number;
  guests: number;
  guestNames: string[];
  phone: string;
  checkIn: string;
  checkOut: string;
  consent: true;
};

export type BasketItem = {listing: string; quantity: number};

export type EnquiryInput =
  | ({type: 'basket'; items: BasketItem[]} & DeliveryTo)
  | ({type: 'stay'} & StayBooking)
  | ({type: 'medicine'; text: string; image?: string} & DeliveryTo)
  | {type: 'food-custom'; text: string; phone?: string}
  | ({type: 'cab'; pickup: Place; drop: Place; vehicle: string} & Customer);

export type CabVehicle = {key: string; label: string; seats: number; perKm: number; minFare: number};

export type EnquiryOptions = {
  roomTypes: Record<string, number>;
  perRoom: number;
  extraPerRoom: number;
  defaultExtraBedPrice: number;
  delivery: {baseKm: number; baseFare: number; perKm: number; foodMaxKm: number; medicineMaxKm: number};
  cabVehicles: CabVehicle[];
  retentionDays: number;
};

export type RouteQuote = {
  distanceKm: number;
  durationMin: number;
  path: [number, number][];
  approximate: boolean;
  fares: (CabVehicle & {fare: number})[];
};

export type BasketQuote = {
  storeName: string;
  subtotal: number;
  distanceKm: number | null;
  approximate: boolean;
  deliveryFee: number | null;
  total: number | null;
};

let optionsCache: Promise<EnquiryOptions> | null = null;

export const pbApi = {
  listings: (service: ServiceKey) =>
    api
      .get<{listings: ApiListing[]}>('/listings', {params: {service, limit: 100, sort: 'createdAt'}})
      .then((r) => r.data.listings),

  listing: (id: string) => api.get<{listing: ApiListing}>(`/listings/${id}`).then((r) => r.data.listing),

  restaurants: () =>
    api.get<{partners: ApiPartner[]}>('/partners', {params: {type: 'restaurant'}}).then((r) => r.data.partners),

  partner: (id: string) =>
    api.get<{partner: ApiPartner; listings: ApiListing[]}>(`/partners/${id}`).then((r) => r.data),

  options: () => {
    optionsCache ||= api.get<EnquiryOptions>('/enquiries/options').then((r) => r.data);
    optionsCache.catch(() => (optionsCache = null));
    return optionsCache;
  },

  quote: (items: BasketItem[], location?: Place) =>
    api.post<BasketQuote>('/enquiries/quote', {items, location}).then((r) => r.data),

  send: (input: EnquiryInput) =>
    api
      .post<{enquiry: Enquiry; accessKey: string; otp: string; whatsapp: string}>('/enquiries', input)
      .then((r) => r.data),

  // keys are "<id>:<accessKey>" pairs saved on this device
  lookup: (keys: string[]) =>
    api.post<{enquiries: Enquiry[]}>('/enquiries/lookup', {keys}).then((r) => r.data.enquiries),

  cancel: (id: string, key: string) => api.post(`/enquiries/${id}/cancel`, {key}),
  forget: (id: string, key: string) => api.post(`/enquiries/${id}/forget`, {key}),

  searchPlaces: (q: string, signal?: AbortSignal) =>
    api.get<{places: Place[]}>('/maps/search', {params: {q}, signal}).then((r) => r.data.places),

  reverse: (lat: number, lng: number) =>
    api.get<{place: Place}>('/maps/reverse', {params: {lat, lng}}).then((r) => r.data.place),

  route: (from: Place, to: Place) =>
    api
      .get<RouteQuote>('/maps/route', {params: {from: `${from.lat},${from.lng}`, to: `${to.lat},${to.lng}`}})
      .then((r) => r.data),
};

export const prescriptionUrl = (id: string, key: string) => `${API_URL}/enquiries/${id}/image?key=${key}`;
