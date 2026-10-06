const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Database
mongoose.connect('mongodb://127.0.0.1:27017/primebookin', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(() => console.log('MongoDB Connected to Primebookin Database'));

// --- SCHEMAS & MODELS ---
const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  role: { type: String, enum: ['hotel_owner', 'restaurant_owner', 'medical_owner', 'cab_owner', 'delivery_partner'] },
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  businessName: String
});
const User = mongoose.model('User', UserSchema);

const ItemSchema = new mongoose.Schema({
  vendorId: String,
  category: String, // 'hotel', 'food', 'medicine', 'cab'
  name: String,
  price: Number,
  details: String,
  isAvailable: { type: Boolean, default: true }
});
const Item = mongoose.model('Item', ItemSchema);

// --- API ENDPOINTS ---

// 1. Register New Vendor or Delivery Driver
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ success: true, message: 'Registration submitted! Waiting for Admin approval.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Admin: Get Pending Approvals
app.get('/api/admin/pending-users', async (req, res) => {
  const pendingUsers = await User.find({ status: 'pending' });
  res.json(pendingUsers);
});

// 3. Admin: Approve or Reject Partner
app.put('/api/admin/approve-user/:id', async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  await User.findByIdAndUpdate(req.params.id, { status });
  res.json({ success: true, message: `Partner status updated to ${status}` });
});

// 4. Approved Vendor: Add Inventory Item (Hotel Room / Food / Cab Tour)
app.post('/api/vendor/add-item', async (req, res) => {
  const { vendorId, name, price, details, category } = req.body;
  
  // Verify vendor is approved before adding
  const vendor = await User.findById(vendorId);
  if (!vendor || vendor.status !== 'approved') {
    return res.status(403).json({ error: 'Account not approved by Admin yet.' });
  }

  const newItem = new Item({ vendorId, name, price, details, category });
  await newItem.save();
  res.json({ success: true, message: 'Item added successfully to Primebookin!' });
});

app.listen(5000, () => console.log('Primebookin API Server running on port 5000'));
