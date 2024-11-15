// controllers/subscriptionController.js
const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  try {
    const { ownerId, planType, vehicleLimit, expirationDate } = req.body;
    const newSubscription = new Subscription({ owner: ownerId, planType, vehicleLimit, expirationDate });
    await newSubscription.save();

    res.status(201).json({ message: "Subscription created successfully", subscription: newSubscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const subscription = await Subscription.findOne({ owner: ownerId });
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
