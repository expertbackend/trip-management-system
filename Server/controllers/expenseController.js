// controllers/expenseController.js
const Expense = require('../models/Expense');
const Booking = require('../models/Booking');

exports.addExpense = async (req, res) => {
  try {
    const { bookingId, driverId,fuel,food,description,vehicleExpanse,totalAmount, EmergencyAmount} = req.body;
    const newExpense = new Expense({ booking: bookingId, driverId,fuel,food,description,vehicleExpanse,totalAmount, EmergencyAmount });
    const searchBooking = await Booking.findById({_id:bookingId});
    if(searchBooking.status !=="in-progress"){
      return res.status(404).json({
        message:"Booking should start first then You can edit"
      })
    }
    console.log(req.user._id)
    await newExpense.save();

    res.status(201).json({ message: "Expense added", expense: newExpense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
