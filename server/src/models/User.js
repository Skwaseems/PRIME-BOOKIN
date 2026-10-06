const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// role: 'customer' for everyone who signs up; 'partner' once an admin approves
// their Partner application; 'admin' for the platform operators.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'partner', 'admin'], default: 'customer' },
    location: { type: String, trim: true },
    addresses: [
      {
        label: String,
        line: { type: String, required: true },
        city: String,
        pincode: String,
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
