const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  planType: { type: String, enum: ['Basic', 'Standard', 'Premium'], required: true },
  expirationDate: Date,
  vehicleLimit: Number,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
