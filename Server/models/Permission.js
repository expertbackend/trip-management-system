const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: ['create', 'read', 'edit', 'delete'], },
    resource: { type: String, required: true, enum: ['vehicle', 'user', 'plan','booking','expense'], }, // Can be extended for more resources
    description: { type: String, default: '' },
});

module.exports = mongoose.model('Permission', permissionSchema);
