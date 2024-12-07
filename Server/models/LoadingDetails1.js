const mongoose = require('mongoose');

const LoadingDetailsSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  advanceAmount: Number,
  netMaterialWeight: Number,
  perTonPrice: Number,
  remainingAmount: { type: Number, default: 0 },
  shortageDeduction: { type: Number, default: 0 },
});

module.exports = mongoose.model('LoadingDetails', LoadingDetailsSchema);
