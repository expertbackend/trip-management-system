const Permission = require('../models/Permission');
const User = require('../models/User');

const hasPermission = (requiredPermission, resource) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id).populate('permissions'); // Fetch user with permissions

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Check if the user is an owner; if so, bypass the permission check
            if (user.role === 'owner') {
                return next(); // Allow access for owners regardless of permissions
            }

            // Check if the user has the required permission for the given resource
            const permission = user.permissions.find(p => p.name === requiredPermission && p.resource === resource);

            if (!permission) {
                return res.status(403).json({ message: 'Permission denied: You do not have the required permission.' });
            }

            // Allow the request to proceed
            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error while checking permissions.' });
        }
    };
};

module.exports = { hasPermission };
