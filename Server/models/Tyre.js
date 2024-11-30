const mongoose = require('mongoose');

const tyreSchema = new mongoose.Schema({
    tyreBrand: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    tyrePosition: {
        type: String,
        enum: [
            'front-left', 'front-right', 
            'rear-left-1', 'rear-right-1', 
            'rear-left-2', 'rear-right-2',
            'rear-left-3', 'rear-right-3',  // Additional positions for more axles
            'rear-left-4', 'rear-right-4',  // For 16-wheeler or 18-wheeler vehicles
            'rear-left-5', 'rear-right-5',  // For 18-wheeler, etc.
            'spare' // For spare tyre
        ],
        required: true,
    },
    tyreMileage: { type: Number, required: true },
    installedAtKm: { type: Number, required: true },
    tyreSerielNo: { type: String, required: true },
    tyreAmount: { type: Number, required: true },
    purchaseFrom: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tyre', tyreSchema);
