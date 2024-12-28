const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    plateNumber: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['created', 'assigned', 'running', 'completed'] },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookings: [{
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    createdAt1:Date,
    updatedAt:Date,
    vehicleType:{type:String},
    branchId:{type:mongoose.Schema.Types.ObjectId,ref:'Branch'},
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
