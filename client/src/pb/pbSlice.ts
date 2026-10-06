import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ServiceKey} from '../types/ApiTypes';

// One dish / medicine in the basket. A basket holds items from one store only.
export type BasketLine = {
  listingId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  service: ServiceKey;
  partnerId: string;
  partnerName: string;
};

// Delivery details remembered on this device for the next checkout.
export type SavedContact = {
  customerName: string;
  phone: string;
  address: string;
};

export type PbStateType = {
  service: ServiceKey;
  basket: BasketLine[];
  // "<id>:<accessKey>" of requests sent from this device, newest first (Bookings).
  requestKeys: string[];
  contact?: SavedContact;
};

const initialState: PbStateType = {
  service: 'stay',
  basket: [],
  requestKeys: [],
};

export const pbSlice = createSlice({
  name: 'pb',
  initialState,
  reducers: {
    setService: (state, action: PayloadAction<ServiceKey>) => {
      state.service = action.payload;
    },
    // Adds one; a different store's item replaces the basket (the screen asks first).
    addToBasket: (state, action: PayloadAction<Omit<BasketLine, 'quantity'>>) => {
      const item = action.payload;
      const lines = (state.basket || []).filter((l) => l.partnerId === item.partnerId && l.quantity);
      const existing = lines.find((l) => l.listingId === item.listingId);
      if (existing) existing.quantity += 1;
      else lines.push({...item, quantity: 1});
      state.basket = lines;
    },
    changeQuantity: (state, action: PayloadAction<{listingId: string; delta: number}>) => {
      state.basket = state.basket
        .map((l) => (l.listingId === action.payload.listingId ? {...l, quantity: l.quantity + action.payload.delta} : l))
        .filter((l) => l.quantity > 0);
    },
    clearBasket: (state) => {
      state.basket = [];
    },
    rememberRequest: (state, action: PayloadAction<string>) => {
      state.requestKeys = [action.payload, ...(state.requestKeys || [])].slice(0, 100);
    },
    forgetRequest: (state, action: PayloadAction<string>) => {
      state.requestKeys = (state.requestKeys || []).filter((k) => !k.startsWith(`${action.payload}:`));
    },
    saveContact: (state, action: PayloadAction<SavedContact | undefined>) => {
      state.contact = action.payload;
    },
  },
});

export const {
  setService,
  addToBasket,
  changeQuantity,
  clearBasket,
  rememberRequest,
  forgetRequest,
  saveContact,
} = pbSlice.actions;
