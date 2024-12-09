// controllers/authController.js
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Token } = require('../models/Token');
const { Noti } = require('../models/Notification');
const Notification = require('../tEst/NotificationService');

exports.register = async (req, res) => {
    console.log('test',req.body.role)
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role,status:"active" });
    await user.save();
    res.status(201).json({ message: 'User registered' });
};

// Login
exports.login = async (req, res) => {
    const { email, password, deviceToken } = req.body; // Include deviceToken in request body
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Save or update the device token
    if (deviceToken) {
        await Token.findOneAndUpdate(
            { userId: user._id },
            { token: deviceToken },
            { upsert: true, new: true } // Create new if it doesn't exist
        );
          // Send welcome notification
    const welcomeTitle = "Welcome!";
    const welcomeBody = "Thank you for logging in!";
    const notification = new Noti({
        userId: user._id,
        title: welcomeTitle,
        body: welcomeBody,
    });
    await notification.save(); // Save to the database

    // Optionally send the notification to the device
    await Notification.sendNotification(deviceToken, welcomeTitle, welcomeBody);
    }
    const token = jwt.sign(
        { id: user._id, role: user.role },
         "hahahahahahahyoudontknowre",
        { expiresIn: '1d' }
    );

  

    res.json({ token, role: user.role,name:user.name,tokenId:user._id });
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role,phoneNumber } = req.body;
        console.log("req.body",req.body)
        // Only owners can create new users
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can create new users.' });
        }
        // Validate the role: prevent owners from creating other owners
        if (role === 'owner') {
            return res.status(400).json({ message: 'You cannot create another owner.' });
        }
        // Create new user under the owner's management (assigning the ownerId)
        const user = new User({
            name,
            email,
            password,
            role,
            ownerId: req.user._id, // Associate the new user with the authenticated owner
            status:"active",
            phoneNumber
        });

        // Save the user to the database
        await user.save();

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users where the ownerId matches the authenticated user's ID
        const users = await User.find({ ownerId: req.user._id }).populate('permissions')

        // If no users are found
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found under your management.' });
        }

        // Return the list of users
        res.status(200).json({ message: 'Users retrieved successfully', users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving users' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from route params
        const { name, role, phoneNumber, address, gender, permissions } = req.body;

        console.log('userId:', userId);
        console.log('req.user:', req.user, role);

        // Only owners can update other users
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can update users.' });
        }

        // Construct the update object with the provided fields
        const updateData = {};
        if (name) updateData.name = name;
        if (role && role !== 'owner') updateData.role = role; // Prevent owners from changing role to 'owner'
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (address) updateData.address = address;
        if (gender) updateData.gender = gender;

        // Permissions update logic
        if (permissions && Array.isArray(permissions)) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
console.log('permisswions',permissions)
            // Filter out permissions that are already in the user's current permissions array
            const updatedPermissions = [
                ...user.permissions,  // Existing permissions
                ...permissions.filter(permission => !user.permissions.includes(permission))  // New permissions that aren't already assigned
            ];

            updateData.permissions = updatedPermissions;
        }

        // Update the user using findByIdAndUpdate without upsert
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData }, // Set the fields to be updated
            { new: true } // `new: true` returns the updated document
        );

        // If no user is found, return an error
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'Error updating user.' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    const { userId } = req.params;
  console.log('params',userId,req.params)
    try {
      // Find user by ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Toggle status
      const newStatus = user.status === "active" ? "inactive" : "active";
  
      // Update user
      user.status = newStatus;
      console.log('new',user.status,newStatus)
      await user.save();
  
      res.status(200).json({
        message: `User status updated to ${newStatus}`,
        user,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


