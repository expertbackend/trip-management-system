const mongoose = require("mongoose");

const vehicleDocumentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: [
      "Pollution Control",
      "Permit Renewal",
      "Temporary Permit",
      "Drivers Badge",
      "Fitness Certificate",
      "Driver Badge",
      "Free Permit",
      "Explosive License",
      "Insurance",
      "Road Tax",
      "Other", // Add any custom types
    ],
    required: true,
  },
  isDailyReminder:{type:Boolean,default:false},
  amount:{type:Number,required:true},
  expiryDate: { type: Date, required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  reminderDate: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model for users
  },
});

module.exports = mongoose.model("VehicleDocument", vehicleDocumentSchema);
