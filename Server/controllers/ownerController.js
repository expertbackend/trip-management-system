const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Plan = require('../models/Plan');
const Permission = require('../models/Permission');
const { Token } = require('../models/Token');
const { Noti } = require('../models/Notification');
const Notification = require('../tEst/NotificationService');
const activeSockets = require('../socketStorage');
const { getIo } = require('../socket');
exports.buyPlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const owner = await User.findById(req.user._id);

        // Check if user exists and is an owner
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can buy plans.' });
        }

        // Find the plan by ID
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found.' });
        }

        // Update the user's plan and maxVehicles field
        owner.planId = plan._id;
        owner.maxVehicles = plan.maxVehicles;  // Update maxVehicles based on the plan
        owner.vehicleCount = 0;  // Reset vehicle count as this is a new plan
        await owner.save();

        // Create the success notification message
        const notificationTitle = "Plan Purchase Successful!";
        const notificationBody = `You have successfully purchased the ${plan.name} plan with ${plan.maxVehicles} max vehicles.`;

        // Save the notification in the database
        const notification = new Noti({
            userId: owner._id,
            title: notificationTitle,
            body: notificationBody,
        });
        await notification.save();  // Save to the database


      
        const socketId = activeSockets.get(req.user._id.toString());
        console.log('socketId',socketId)
                    const io = getIo(); // Get the io instance
            if (socketId) {
              io.emit('notification', {
                title: notificationTitle,
                body: notificationBody,
                timestamp: new Date().toISOString(),
              });
              console.log('Real-time notification sent to user:', owner._id);
            } else {
              console.log('User is not connected to a socket.');
            }
        // Optionally send a push notification to the user's device if device token exists
        if (owner.deviceToken) {
            await Notification.sendNotification(owner.deviceToken, notificationTitle, notificationBody);
            console.log("Push notification sent to user:", owner._id);
           
        }

        // Return the success response
        return res.status(200).json({ message: 'Plan purchased successfully and notification sent.', owner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};


exports.getPlans = async (req, res) => {
    try {
      const plans = await Plan.find();
      if (!plans) {
        return res.status(404).json({ message: 'No plans found.' });
      }
      res.status(200).json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
exports.addVehicle = async (req, res) => {
    try {
        const owner = await User.findById(req.user._id).populate('planId');
        
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can add vehicles.' });
        }

        if (!owner.planId) {
            return res.status(400).json({ message: 'You must purchase a plan first.' });
        }

        // Check if the owner has reached the max vehicle limit for their plan
        if (owner.vehicleCount >= owner.maxVehicles) {
            return res.status(400).json({ message: `You can only add up to ${owner.maxVehicles} vehicles with your current plan.` });
        }

        // Add vehicle logic
        const { name, plateNumber } = req.body;
        const vehicle = new Vehicle({ name, plateNumber, owner: owner._id ,status:"created"});
        await vehicle.save();

        // Increment vehicle count for the owner
        owner.vehicleCount += 1;
        await owner.save();

        return res.status(200).json({ message: 'Vehicle added successfully.', vehicle });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Assign vehicle to driver
exports.assignVehicleToDriver = async (req, res) => {
    try {
        const { driverId, vehicleId } = req.body;
        console.log(req.body)
        // console.log('driverId',driverId,vehicleId)
        const owner = await User.findById(req.user._id);

        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can assign vehicles.' });
        }

        const driver = await User.findById(driverId);
        if (!driver || driver.role !== 'driver') {
            return res.status(404).json({ message: 'Driver not found or invalid role.' });
        }

        if (driver.vehicle) {
            return res.status(400).json({ message: 'Driver already has a vehicle assigned.' });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        vehicle.status = 'assigned';
        vehicle.driver=driverId;
        await vehicle.save();
        driver.vehicle = vehicle._id;
        await driver.save();

        return res.status(200).json({ message: 'Vehicle assigned to driver successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Assign permissions to user
exports.assignPermissions = async (req, res) => {
    try {
        const { targetUserId, permissions } = req.body;
// console.log("target",targetUserId,permissions)
        // Check if the logged-in user is an owner
        const owner = await User.findById(req.user._id);
        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can assign permissions.' });
        }

        // Find the target user by ID
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found.' });
        }

        // Ensure that the permissions provided are valid (exist in the Permission model)
        const validPermissions = await Permission.find({ '_id': { $in: permissions } });

        if (validPermissions.length !== permissions.length) {
            return res.status(400).json({ message: 'One or more permissions are invalid.' });
        }

        // Ensure that the user doesn't already have the same permission
        targetUser.permissions = [
            ...new Set([
                ...targetUser.permissions, 
                ...validPermissions.map(permission => permission._id)
            ]) // Add new permissions to the target user while avoiding duplicates
        ];

        // Save the target user with the updated permissions
        await targetUser.save();

        return res.status(200).json({ message: 'Permissions assigned successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while assigning permissions.' });
    }
};

exports.getAllPermission = async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.status(200).json({ permissions });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching permissions' });
      }
};

// Get all vehicles for the authenticated owner
exports.getAllVehicles = async (req, res) => {
    try {
        const owner = await User.findById(req.user._id).populate('planId');

        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can view their vehicles.' });
        }

        // Fetch all vehicles belonging to the owner
        const vehicles = await Vehicle.find({ owner: owner._id }).populate('driver');

        return res.status(200).json({ message: 'Vehicles fetched successfully.', vehicles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Get all drivers
exports.findDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' }).select('name email vehicle');

        if (!drivers || drivers.length === 0) {
            return res.status(404).json({ message: 'No drivers found.' });
        }

        return res.status(200).json({ message: 'Drivers fetched successfully.', drivers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.getDrivers = async(req,res)=>{
    try {
        const ownerId = req.user._id
        const getDrivers = await User.find({ownerId});
        if(!getDrivers){
            return res.status(404).json({
                message:"No Driver Found"
            })
        }
        return res.status(200).json({
            message:"Drivers Found",
            drivers: getDrivers
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}