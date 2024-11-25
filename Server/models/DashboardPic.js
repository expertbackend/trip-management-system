const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the image schema
const imageSchema = new Schema({
  url: {
    type: String,
    required: true,  // Ensure that each image has a URL
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',  // Referencing the Driver model
    required: true,  // Every image must be associated with a driver
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the image model
const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
