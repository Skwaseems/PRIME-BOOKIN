const crypto = require('crypto');
const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  { label: String, address: String, lat: Number, lng: Number },
  { _id: false },
);

const STATUSES = [
  'new', // waiting for a vendor / driver / pharmacy
  'accepted', // vendor accepted (food, medicine) or driver accepted (cab)
  'preparing',
  'ready',
  'picked_up',
  'delivered',
  'confirmed', // hotel confirmed the stay
  'checked_in',
  'arrived', // driver at pickup
  'started', // ride started (after OTP)
  'completed',
  'rejected',
  'cancelled',
  'closed', // custom requests handled by the team
];

const RIDER_STAGES = ['assigned', 'at_store', 'picked_up', 'at_customer', 'delivered'];

// Every customer request: a delivery order (basket), a medicine request, a room
// booking, a cab ride, or a custom dish request. It is also sent to WhatsApp.
const enquirySchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    // Secret the sending device keeps; needed to look the request up again.
    accessKey: { type: String, select: false },
    type: { type: String, enum: ['basket', 'stay', 'medicine', 'cab', 'food-custom'], required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Customer details (removed automatically after the retention period).
    customerName: String,
    contactPhone: String,
    address: String,
    location: placeSchema,
    consentAt: Date,

    items: [
      {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
        name: String,
        service: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        partnerName: String,
        _id: false,
      },
    ],
    text: String,
    image: { type: String, select: false }, // prescription photo (data URL)
    hasImage: { type: Boolean, default: false },

    stay: {
      listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
      name: String,
      roomType: String,
      rooms: Number,
      guests: Number,
      extraBeds: Number,
      guestNames: [String],
      checkIn: String,
      checkOut: String,
      nights: Number,
    },

    cab: {
      pickup: placeSchema,
      drop: placeSchema,
      vehicle: String,
      vehicleKey: String,
      distanceKm: Number,
      durationMin: Number,
      approximate: Boolean,
    },

    // Who is fulfilling it
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', index: true }, // hotel / restaurant / pharmacy
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', index: true }, // cab
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', index: true }, // delivery
    riderStage: { type: String, enum: RIDER_STAGES },
    // Partners who were alerted about this job (for "taken by someone else" updates).
    alerted: { type: [mongoose.Schema.Types.ObjectId], select: false },

    // 4-digit code the customer gives the rider (delivery) or driver (ride start).
    otp: { type: String, select: false },

    distanceKm: Number, // store to customer, for deliveries
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    earnings: {
      partner: Number,
      rider: Number,
      driver: Number,
      platform: Number,
    },

    status: { type: String, enum: STATUSES, default: 'new', index: true },
    statusNote: String,
    timeline: [{ status: String, at: { type: Date, default: Date.now }, by: String, _id: false }],
    finishedAt: Date,
    anonymizedAt: Date,
  },
  { timestamps: true },
);

// Secrets are created once. accessKey/otp are not loaded by default, so checking
// "is it empty?" on later saves would silently replace them.
enquirySchema.pre('validate', function setCodes(next) {
  if (!this.isNew) return next();
  if (!this.code) this.code = `PB${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  if (!this.accessKey) this.accessKey = crypto.randomBytes(16).toString('hex');
  if (!this.otp) this.otp = String(crypto.randomInt(1000, 10000));
  if (!this.timeline?.length) this.timeline = [{ status: this.status, by: 'customer' }];
  next();
});

enquirySchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.image;
    delete ret.accessKey;
    delete ret.otp;
    delete ret.alerted;
    return ret;
  },
});

module.exports = mongoose.model('Enquiry', enquirySchema);
module.exports.STATUSES = STATUSES;
module.exports.RIDER_STAGES = RIDER_STAGES;
