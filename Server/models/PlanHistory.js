const mongoose = require('mongoose');

const planHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    planName: { type: String }, // Save for quick reference
    purchasedAt: { type: Date, default: Date.now },
    expiryDate: { type: Date }, // Expiry date of the plan
    amount: { type: Number }, // Optional, if plans have pricing
});

module.exports = mongoose.model('PlanHistory', planHistorySchema);
