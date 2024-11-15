// controllers/vehicleController.js
const Vehicle = require('../models/Vehicle');
const Subscription = require('../models/Subscription');

exports.addVehicle = async (req, res) => {
  try {
    const { ownerId, registrationNumber, model } = req.body;
    const subscription = await Subscription.findOne({ owner: ownerId });

    if (!subscription || !subscription.isActive || subscription.vehicleLimit <= 0)
      return res.status(400).json({ message: "Subscription not active or vehicle limit reached" });

    const newVehicle = new Vehicle({ owner: ownerId, registrationNumber, model });
    await newVehicle.save();

    subscription.vehicleLimit -= 1;
    await subscription.save();

    res.status(201).json({ message: "Vehicle added successfully", vehicle: newVehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { vehicleId, driverId } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    vehicle.driver = driverId;
    await vehicle.save();

    res.json({ message: "Driver assigned successfully", vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
