const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  pickupLocation: {
    address: { type: String}, // Store the pickup address
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number] }, // GeoJSON format: [lng, lat]
    },
  },
  dropoffLocation: {
    address: { type: String}, // Store the dropoff address
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number] }, // GeoJSON format: [lng, lat]
    },
  },
  fare: Number,
  kmDriven: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'] },
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
  invoice: {
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
  startDashboardImage : {
    type: String,
    
  },
  totalNetMaterialWeight:{type:Number},
  perTonPrice:{type:Number},
  advance:{type:Number},
  shortageDeduction:{type:Number},
  remainingAmount:{type:Number},
  endDashboardImage : {
    type: String,
   
  },
  shortageWeight:{type:Number},
  unloading:{type:Boolean,default:false}
});

module.exports = mongoose.model('Booking', bookingSchema);
