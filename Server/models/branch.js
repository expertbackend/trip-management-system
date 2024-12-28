const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const branchSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the Owner model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Branch = mongoose.model('Branch', branchSchema);
module.exports = Branch;
