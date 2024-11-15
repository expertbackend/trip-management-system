const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, enum: ['superadmin', 'owner', 'operator', 'driver'], required: true },
  permissions: [{ type: String }],
});

module.exports = mongoose.model('Role', roleSchema);
