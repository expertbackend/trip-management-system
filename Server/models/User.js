const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['owner', 'driver', 'operator', 'superadmin'], required: true },
    isVerified: { type: Boolean, default: false },
    planIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }], 
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    vehicleCount: { type: Number, default: 0 },
    maxVehicles: { type: Number, default: 0 },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active','inactive'] },
    bookingStatus: { type: String, enum: ['pending','assigned',"in-progress","completed"],default:"pending" },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    fuelExpanse: [{ date: Date, amount: String }],
    driverExpanse: [{ date: Date, amount: String }],
    vehicleExpanse: [{ date: Date, amount: String }],
    expenseDate: { type: Date, unique: true },
    planExpiryDate: { type: Date },
    phoneNumber: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String },
  companyLogoUrl: { type: String },
    
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
