const mongoose = require('mongoose');

const MurtiSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. Ganpati, Navratri, Krishna Theme, Mavla Theme, Royal Theme, Narasimha Theme
  size: { type: String, required: true },
  price: { type: Number, required: true },
  bookingAmount: { type: Number, default: 1000 },
  status: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Sold', 'Out Of Stock'], 
    default: 'Available' 
  },
  photos: [{ type: String }],
  videos: [{ type: String }],
  description: { type: String, default: '' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerCity: { type: String, required: true },
  shippingType: { 
    type: String, 
    enum: ['Self Pickup', 'Local Delivery', 'Transport Booking'], 
    required: true 
  },
  shippingDate: { type: Date, required: true },
  murtiCode: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  paymentId: { type: String, default: '' },
  signature: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otpSecret: { type: String, default: '' },
  otpExpires: { type: Date, default: null }
});

// Avoid OverwriteModelError in case of hot reloading or multiple loads
const Murti = mongoose.models.Murti || mongoose.model('Murti', MurtiSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

module.exports = {
  Murti,
  Booking,
  Admin
};
