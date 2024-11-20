const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    maxVehicles: { type: Number, required: true },
    duration: { type: Number, required: true },
});

module.exports = mongoose.model('Plan', planSchema);
