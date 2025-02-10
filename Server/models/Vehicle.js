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
    vehicleStatus: { type: String, enum: ['not_started', 'started', 'ended'], default: 'not_started' },
    dailyLogs: [{
        date: { type: Date, required: true }, // Store the date for the log
        status: { type: String, enum: ['started', 'ended'], required: true }, // Store the status for the day
        hours: { type: Number, required: true } // Store the hours for that day
    }]

});

module.exports = mongoose.model('Vehicle', vehicleSchema);
