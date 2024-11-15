const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  pickupLocation: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  dropoffLocation: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  fare: Number,
  kmDriven: { type: Number, default: 0 },  // Add kilometers driven
  status: { type: String, enum: ['pending', 'assigned', 'in-progress', 'completed', 'canceled'] },
  startDate: Date,
  endDate: Date,
  customerName: String,
  custPhNo: Number,
  custEmailId: String,
  custAddress: String,
  basePay: Number,
  perKmCharge: Number,
  halt: Number,
  tax: Number,
  toll: Number,
  discount: Number,
  totalEstimatedAmount: Number,
  invoice: {  // Invoice details
    invoiceId:String,
    customerName:String,
    custPhNo:Number,
    custEmailId:String,
    custAddress:String,
    totalFare: Number,
    taxAmount: Number,
    tollAmount: Number,
    discountAmount: Number,
    finalAmount: Number,
    generatedAt: Date
  },
  customerVerified: { type: Boolean, default: false },
  extraExpanse: { type: Number, default: 0 },
  extraExpanseDescription: { type: String, default: '' },
  profit: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('Booking', bookingSchema);
