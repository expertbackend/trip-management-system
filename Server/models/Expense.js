const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  fuel: Number,
  food:Number,
  vehicleExpanse:Number,
  totalAmount:Number,
  EmergencyAmount:Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
