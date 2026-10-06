import type {Enquiry, Place} from './api';
import {prescriptionUrl} from './api';

export const SUPPORT_PHONE = '917768817510';

export const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const mapsLink = (p: Pick<Place, 'lat' | 'lng'>) => `https://maps.google.com/?q=${p.lat},${p.lng}`;

export const duration = (min: number) =>
  min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`;

const B = '❖';

const deliveryBlock = (e: Enquiry) =>
  `${B} Customer: ${e.customerName} (+91 ${e.contactPhone})\n` +
  `${B} Delivery Address: ${e.address}\n` +
  (e.location ? `${mapsLink(e.location)}\n` : '');

// WhatsApp message for each kind of request, worded as in the Primebookin app.
// `key` is the request's access key, needed for the prescription photo link.
export const buildMessage = (e: Enquiry, key?: string): string => {
  const ref = `\n\nRef: ${e.code}`;

  switch (e.type) {
    case 'basket': {
      const store = e.items[0]?.partnerName;
      const lines = e.items
        .map((i, n) => `${n + 1}. ${B} ${i.name} (Qty ${i.quantity}) - ₹${i.price * i.quantity}`)
        .join('\n');
      return (
        `Hello PRIMEBOOKIN, New Food Order${store ? ` from ${store}` : ''}:\n\n` +
        deliveryBlock(e) +
        `\n${B} ITEMS:\n${lines}\n\n` +
        `${B} Subtotal: ₹${e.subtotal}\n` +
        `${B} Delivery Charge: ₹${e.deliveryFee}${e.distanceKm != null ? ` (${e.distanceKm} km)` : ''}\n` +
        `${B} TOTAL PAYABLE: ₹${e.total}\n\n` +
        `Please initialize logistics lines!${ref}`
      );
    }
    case 'stay': {
      const s = e.stay!;
      const names = s.guestNames.map((n, i) => `   ${i + 1}. ${n}`).join('\n');
      return (
        `Hello PRIMEBOOKIN, New Dynamic Room Booking Request:\n\n` +
        `${B} Hotel: ${s.name}\n` +
        `${B} Selected Room: ${s.roomType}\n` +
        `${B} Rooms: ${s.rooms}\n` +
        `${B} Guests: ${s.guests}${s.extraBeds ? ` (${s.extraBeds} extra bed${s.extraBeds > 1 ? 's' : ''})` : ''}\n` +
        `${B} Guest Names:\n${names}\n` +
        `${B} Mobile: +91 ${e.contactPhone}\n` +
        `${B} Check-in: ${s.checkIn}\n` +
        `${B} Check-out: ${s.checkOut}\n` +
        `${B} Calculated Dynamic Total: ${rupees(e.total)} (${s.nights} Night${s.nights > 1 ? 's' : ''})\n\n` +
        `Please confirm room availability!${ref}`
      );
    }
    case 'medicine': {
      const details = e.text ? `"${e.text}"` : '(see prescription image)';
      const image = e.hasImage && key ? `\n${B} Prescription Image:\n${prescriptionUrl(e._id, key)}\n` : '';
      return (
        `Hello PRIMEBOOKIN, I want to route a customized Pharmacy Direct Text parameter request:\n\n` +
        deliveryBlock(e) +
        `\n${B} Details Provided:\n${details}\n${image}\n` +
        `Please reply with pricing logs!${ref}`
      );
    }
    case 'food-custom':
      return (
        `Hello PRIMEBOOKIN, I want to route a customized Kitchen Dish parameter request:\n\n` +
        `${B} Details Provided:\n"${e.text}"\n\n` +
        `Please reply with pricing logs!${ref}`
      );
    case 'cab': {
      const c = e.cab!;
      return (
        `Hello PRIMEBOOKIN, I need to book an immediate Taxi Ride:\n\n` +
        `${B} Customer: ${e.customerName} (+91 ${e.contactPhone})\n` +
        `${B} PICKUP STATION: ${c.pickup.label}\n${mapsLink(c.pickup)}\n` +
        `${B} DROP LOCATION: ${c.drop.label}\n${mapsLink(c.drop)}\n` +
        `${B} Distance: ${c.approximate ? '~' : ''}${c.distanceKm} km (about ${duration(c.durationMin)})\n` +
        `${B} Vehicle: ${c.vehicle}\n` +
        `${B} Estimated Fare: ${rupees(e.total)}\n\n` +
        `Please share quote estimations!${ref}`
      );
    }
  }
};

export const openWhatsApp = (message: string, phone = SUPPORT_PHONE) => {
  window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
