const mongoose = require('mongoose');

// Which kind of listing each business type is allowed to publish.
// Cab drivers publish tour packages; delivery partners publish nothing.
const SERVICE_BY_TYPE = {
  hotel: 'stay',
  restaurant: 'food',
  pharmacy: 'medicine',
  cab: 'cab',
  delivery: null,
};

// Documents asked for at registration, per partner type.
const DOCUMENTS_BY_TYPE = {
  hotel: ['GST Certificate', 'Property Ownership / Lease', 'Bank Details (Cancelled Cheque)'],
  restaurant: ['FSSAI Licence', 'GST Certificate', 'Bank Details (Cancelled Cheque)'],
  pharmacy: ['Drug Licence', 'GST Certificate', 'Pharmacist Registration', 'Bank Details (Cancelled Cheque)'],
  cab: ['Driving Licence', 'Vehicle RC', 'Vehicle Insurance', 'Aadhaar Card'],
  delivery: ['Aadhaar Card', 'PAN Card', 'Driving Licence'],
};

const pointSchema = new mongoose.Schema({ lat: Number, lng: Number, at: Date }, { _id: false });
// A field literally named "type" needs its own schema so Mongoose reads it as data.
const vehicleSchema = new mongoose.Schema({ type: { type: String }, number: String, model: String }, { _id: false });

const partnerSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.keys(SERVICE_BY_TYPE), required: true },
    businessName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    mapUrl: { type: String, trim: true },
    image: { type: String },
    // Where the business is; used for delivery distance and nearby alerts.
    location: pointSchema,

    // Cab drivers
    vehicle: vehicleSchema, // type = key of a vehicle in Settings.cab.vehicles

    // Riders and drivers: available for jobs, and their last known position.
    online: { type: Boolean, default: false },
    lastLocation: pointSchema,

    // Restaurants / pharmacies: usual preparation time.
    prepTimeMin: { type: Number, default: 20 },

    documents: {
      type: [
        {
          label: String,
          number: String,
          file: String, // data URL; served to admins only
          uploadedAt: { type: Date, default: Date.now },
          _id: false,
        },
      ],
      select: false,
    },
    termsAcceptedAt: Date,

    status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    statusNote: { type: String },
    isOpen: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One application per business type per user.
partnerSchema.index({ owner: 1, type: 1 }, { unique: true });
partnerSchema.index({ type: 1, status: 1, online: 1 });

partnerSchema.virtual('service').get(function service() {
  return SERVICE_BY_TYPE[this.type];
});

partnerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    // Documents are only sent through the admin documents endpoint.
    if (ret.documents) ret.documents = ret.documents.map(({ file, ...rest }) => ({ ...rest, hasFile: !!file }));
    return ret;
  },
});

module.exports = mongoose.model('Partner', partnerSchema);
module.exports.SERVICE_BY_TYPE = SERVICE_BY_TYPE;
module.exports.DOCUMENTS_BY_TYPE = DOCUMENTS_BY_TYPE;
