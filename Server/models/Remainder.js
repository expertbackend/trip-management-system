const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reminderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Refers to the User model
  },
  vehicleId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Vehicle', // Refers to the Vehicle model
  },
  document: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'VehicleDocument', // Refers to the VehicleDocument model
  },
  reminderMessage: {
    type: String, // Store the reminder message content to show on the announcement page
    required: true, // Ensure there's always a message
  },
  reminderDate: {
    type: Date,
    required: true, // The date when the reminder should be shown
  },
  isSent: {
    type: Boolean,
    default: false, // Tracks if the reminder has already been sent (for processing reminders)
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'expired'], 
    default: 'pending', // Tracks reminder status (whether it's pending, sent, or expired)
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date/time
  },
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
