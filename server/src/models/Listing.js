const mongoose = require('mongoose');

const SERVICES = ['stay', 'food', 'medicine', 'cab'];

// A single bookable/orderable thing: a room, a dish, a medicine, or a cab ride.
// Service-specific fields live in `details`, e.g.
//   stay:     { roomType, minGuests, maxGuests, amenities: [] }
//   food:     { isVeg, kcal, weight }
//   medicine: { requiresPrescription, packSize }
//   cab:      { vehicle, seats, tripType: 'point-to-point' | 'full-day' }
const listingSchema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true, index: true },
    service: { type: String, enum: SERVICES, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    // What `price` is charged per, shown next to it in the app.
    priceUnit: { type: String, enum: ['item', 'night', 'trip', 'day'], default: 'item' },
    images: [{ type: String }],
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

listingSchema.index({ name: 'text', description: 'text', category: 'text' });
listingSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Listing', listingSchema);
module.exports.SERVICES = SERVICES;
