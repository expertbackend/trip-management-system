const mongoose = require("mongoose");

const vehicleServiceSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    enum: [
      "Engine Oil Change",
      "ATF Brake Oil Change",
      "Gearbox Oil Change",
      "Battery Change",
      "Coolant Change",
      "Spark Plug Change",
      "Full Service",
      "Mini Vehicle Service",
      "Others", // Add any custom service types
    ],
    required: true,
  },
  servicingMileage:{type:Number},
  serviceDate: { type: Date, required: true },
  odometerReading: { type: Number, required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  amount: { type: Number },
  companyName: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VehicleService", vehicleServiceSchema);
