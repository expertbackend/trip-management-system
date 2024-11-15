const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "User", index: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    timestamp: { type: Date, default: Date.now }
  });
  
  locationSchema.index({ location: '2dsphere' });
  locationSchema.index({ userId: 1, timestamp: -1 }); // Compound index for efficient queries
  
  module.exports = mongoose.model('Location', locationSchema);
  
