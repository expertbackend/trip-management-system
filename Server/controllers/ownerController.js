const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Plan = require('../models/Plan');
const Permission = require('../models/Permission');
const { Token } = require('../models/Token');
const { Noti } = require('../models/Notification');
const Notification = require('../tEst/NotificationService');
const Location = require('../models/Location');
const activeSockets = require('../socketStorage');
const { getIo } = require('../socket');
const PlanHistory = require('../models/PlanHistory');
const PaymentRequest = require('../models/PaymentRequest');
const Booking = require('../models/Booking');
const axios = require('axios');
const Branch = require('../models/branch');

exports.buyPlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const owner = await User.findById(req.user._id);

        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can buy plans.' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found.' });
        }

        const paymentRequest = new PaymentRequest({
            ownerId: owner._id,
            planId: plan._id,
            planName: plan.name,
            amount: plan.price || 0,
            status: 'Pending', // The request is in 'Pending' state
        });

        await paymentRequest.save();

        // Send a notification to superadmin about the new payment request
        const superadmin = await User.findOne({ role: 'superadmin' });
        if (superadmin) {
            const superadminNotification = new Noti({
                userId: superadmin._id,
                title: 'New Payment Request',
                body: `A new payment request has been made by ${owner.name} for the ${plan.name} plan.`,
            });
            await superadminNotification.save();
        }
        const notificationTitle = "New Payment Request";
        const notificationBody = `A new payment request has been made by ${owner.name} for the ${plan.name} plan.`;
        const deviceToken = await Token.findOne({ userId: superadmin._id });
        if (deviceToken?.token) {
          await Notification.sendNotification(deviceToken.token, notificationTitle, notificationBody);
        }
        return res.status(200).json({ message: 'Payment request sent to superadmin for approval.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};




exports.getPlanHistory = async (req, res) => {
    try {
        // Ensure the user is authenticated and req.user is populated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
        }

        const userId = req.user._id; // Assuming authentication middleware populates `req.user`

        // Fetch the user document with associated planIds (optional, if needed for further filtering)
        const user = await User.findById(userId).populate('planIds'); // Assuming planIds is a field that holds plan references

        // If the user doesn't exist or doesn't have plans, return an error
        if (!user || !user.planIds || user.planIds.length === 0) {
            return res.status(200).json({ message: 'User has no associated plans.' });
        }

        // Fetch plan history for the logged-in user by userId
        const history = await PlanHistory.find({ userId: userId }) // Filter by userId to ensure it's the logged-in user's history
            .populate('planId'); // Populate planId to get full plan details

        console.log('User Plan History:', history);

        // If no plan history is found, return an error message
        if (history.length === 0) {
            return res.status(404).json({ message: 'No plan history found for this user.' });
        }

        // Return the plan history
        return res.status(200).json({ planHistory: history });

    } catch (error) {
        console.error('Error fetching plan history:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};




exports.getPlans = async (req, res) => {
    try {
      const plans = await Plan.find().sort({  price: 1 });
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
        const owner = await User.findById(req.user._id)

        if (!owner || owner.role !== 'owner') {
            return res.status(403).json({ message: 'Only owners can add vehicles.' });
        }

       

        const currentDate = new Date();

        // Check if the plan has expired
        if (owner.planExpiryDate && owner.planExpiryDate < currentDate) {
            return res.status(400).json({ message: 'Your current plan has expired. Please renew or purchase a new plan to add vehicles.' });
        }

        // Check if the owner has reached the max vehicle limit for their plan
        if (owner.vehicleCount >= owner.maxVehicles) {
            return res.status(400).json({
                message: `You’ve reached the vehicle limit for your current plan. You can add up to ${owner.maxVehicles} vehicles. To add more, please consider upgrading to a higher plan.`
              });
                      }

        // Add vehicle logic
        const { name, plateNumber,type,branchId } = req.body;
        const vehicle = new Vehicle({ name, plateNumber,vehicleType:type, owner: owner._id, status: "created" ,createdAt1:new Date(),branchId:branchId});
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
console.log('tarhetUser',targetUser.permissions)
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
        let userId;
        if (req.user.role === 'operator' || req.user.role === 'driver') {
            userId = req.user.ownerId;
        } else {
            userId = req.user._id;
        }

        const owner = await User.findById(userId).populate('planIds');
        console.log('owner', owner._id);

        // Fetch all vehicles belonging to the owner and populate bookings with the related Booking details
        const vehicles = await Vehicle.find({ owner: owner._id })
            .populate('driver') // Populating driver details
            .populate({
                path: 'bookings.bookingId', // Populate the bookingId inside the bookings array
                model: 'Booking' // Explicitly define the model for the bookings
            });

        return res.status(200).json({ message: 'Vehicles fetched successfully.', vehicles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Get all drivers
exports.findDrivers = async (req, res) => {
    try {
        let userId;
        if (req.user.role === 'operator' || req.user.role === 'driver') {
            userId = req.user.ownerId;
        } else {
            userId = req.user._id;
        }
        console.log('userId',userId)
        const drivers = await User.find({ role: 'driver',status:'active',ownerId:userId }).select('name email vehicle');

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
const MOVEMENT_THRESHOLD = 10;
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Distance in meters
    return distance;
  }
exports.driversloc = async(req,res)=>{
    try {
        const driverId = req.params.driverId;
    const driverData = await User.findById({
        _id:driverId
    })
        // Fetch the latest location
        const latestLocation = await Location.findOne({ userId: driverId })
          .sort({ timestamp: -1 })
          .exec();
    
        if (!latestLocation) {
          return res.status(404).json({ message: 'Location not found for this driver.' });
        }
    
        // Fetch the previous location (second latest)
        const previousLocation = await Location.findOne({ userId: driverId })
          .sort({ timestamp: -1 })
          .skip(1) // Skip the most recent record to get the previous one
          .exec();
    
        if (!previousLocation) {
          return res.status(404).json({ message: 'No previous location data available.' });
        }
    
        // Calculate the distance between the latest and previous locations
        const distance = getDistance(
          latestLocation.location.coordinates[1], // latest latitude
          latestLocation.location.coordinates[0], // latest longitude
          previousLocation.location.coordinates[1], // previous latitude
          previousLocation.location.coordinates[0]  // previous longitude
        );
    
        // Determine if the driver is moving or parked
        const status = distance > MOVEMENT_THRESHOLD ? 'moving' : 'parked';
        const booking = await Booking.findOne({ driver:driverId, status: 'in-progress' }).exec();
        
        // Return the location and status
        res.json({
          location: {
            latitude: latestLocation.location.coordinates[1],
            longitude: latestLocation.location.coordinates[0],
            status: status,
          drivername:driverData.name
          },
          booking: {
            pickupLocation: booking.pickupLocation, // Assuming booking schema has these fields
            dropoffLocation: booking.dropoffLocation,
          },
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }

}

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user._id; 
        const user = await User.findById(userId).populate('vehicle').populate('bookings').populate('ownerId');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let profileData;

        if (user.role === 'owner') {
            profileData = {
                name: user.name,
                email: user.email,
                maxVehicles: user.maxVehicles,
                vehicleCount: user.vehicleCount,
                role:user.role,
                phoneNumber:user.phoneNumber,
                address:user.address || ""
            };
        } else if (user.role === 'operator' || user.role === 'driver' || user.role === 'superadmin') {
            profileData = {
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                permissions: user.permissions,
                vehicle: user.vehicle,
                ownerId: user.ownerId,
                status: user.status,
            };
        } else {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, profile: profileData });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getAllPaymentRequests = async (req, res) => {
    try {
      const paymentRequests = await PaymentRequest.find().populate('ownerId');
      res.status(200).json(paymentRequests);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      res.status(500).json({ message: 'Error fetching payment requests' });
    }
  };
  exports.approvePaymentRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const paymentRequest = await PaymentRequest.findById(id);

        if (!paymentRequest) {
            return res.status(404).json({ message: 'Payment request not found' });
        }

        // Update the status of the payment request to 'Approved'
        paymentRequest.status = 'Approved';
        await paymentRequest.save();

        // Now update the user's plan details
        const owner = await User.findById(paymentRequest.ownerId);
        const plan = await Plan.findById(paymentRequest.planId);

        if (!owner || !plan) {
            return res.status(404).json({ message: 'User or plan not found' });
        }

        const currentDate = new Date();
        let newPlanExpiryDate;

        // Calculate the new expiry date for the plan
        if (owner.planExpiryDate && !isNaN(new Date(owner.planExpiryDate).getTime())) {
            newPlanExpiryDate = new Date(owner.planExpiryDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
        } else {
            newPlanExpiryDate = new Date(currentDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
        }

        // Update the maxVehicles for the owner based on the approved plan
        owner.maxVehicles = (owner.maxVehicles || 0) + plan.maxVehicles;
        owner.planExpiryDate = newPlanExpiryDate; // Set the expiry date for the owner's plan
console.log('planIds',plan._id)
        // Add the new planId to the owner's planIds array
        owner.planIds.push(plan._id);

        await owner.save();
        const planHistory = new PlanHistory({
            userId: owner._id,
            planId: plan._id,
            planName: plan.name,
            purchasedAt: currentDate,
            expiryDate: newPlanExpiryDate,
            amount: paymentRequest.amount, // Assuming paymentRequest contains the amount paid
        });

        await planHistory.save();
        // Create a notification for the user
        const notificationTitle = 'Plan Purchase Approved';
        const notificationBody = `Your request for the ${plan.name} plan has been approved! You now have ${owner.maxVehicles} max vehicles.`;

        const notification = new Noti({
            userId: owner._id,
            title: notificationTitle,
            body: notificationBody,
        });
        await notification.save();

        // Send real-time notification to the user
        const socketId = activeSockets.get(owner._id.toString());
        const io = getIo();
        if (socketId) {
            io.emit('notification', {
                title: notificationTitle,
                body: notificationBody,
                timestamp: new Date().toISOString(),
            });
        }

        const deviceToken = await Token.findOne({ userId: owner._id });
        if (deviceToken?.token) {
          await Notification.sendNotification(deviceToken.token, notificationTitle, notificationBody);
        }

        return res.status(200).json({ message: 'Payment request approved and user plan updated.' });
    } catch (error) {
        console.error('Error approving payment request:', error);
        return res.status(500).json({ message: 'Error approving payment request' });
    }
};



  
  // PATCH - Reject a payment request
  exports.rejectPaymentRequest = async (req, res) => {
    try {
      const { id } = req.params;
      const paymentRequest = await PaymentRequest.findById(id);
  
      if (!paymentRequest) {
        return res.status(404).json({ message: 'Payment request not found' });
      }
  
      paymentRequest.status = 'Rejected';  // Change the status to 'Rejected'
      await paymentRequest.save();
  
      res.status(200).json({ message: 'Payment request rejected successfully' });
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      res.status(500).json({ message: 'Error rejecting payment request' });
    }
  };

  exports.createOwner = async (req, res) => {
    try {
        const { name, email, phoneNumber, gender, address, companyLogoUrl,password,role } = req.body;
        console.log('req',req.body,req.params)
        // Only superadmins can create new owners
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Only superadmins can create new owners.' });
        }

        // Optionally: Prevent superadmins from creating other superadmins (if needed)
        if (req.body.role === 'superadmin') {
            return res.status(400).json({ message: 'You cannot create another superadmin.' });
        }

        // Create a new owner with the provided name and other details
        const newOwner = new User({
            name,  // Only one field for name
            email,
            phoneNumber,
            gender,
            address,
            companyLogoUrl,
            password,
            // Optionally, associate the creator superadmin with the new owner (if needed)
            createdBy: req.user._id,
            role
        });

        // Save the new owner to the database
        await newOwner.save();

        // Return success response
        res.status(201).json({ message: 'Owner created successfully', owner: newOwner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating owner' });
    }
};


exports.viewVehicle = async (req, res) => {
    const { id } = req.params; // Use the ID from params

    try {
        const vehicle = await Vehicle.findById(id) // Use findById to fetch by _id
            .populate('owner', 'name email') // Populate the owner details
            .populate('driver', 'name phoneNumber') // Populate the driver details
            .populate('bookings.bookingId'); // Populate booking details

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json(vehicle); // Return the vehicle data
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Edit Vehicle Data (PUT)
exports.editVehicle = async (req, res) => {
    const { id } = req.params; // Use the ID from params
    const updatedData = req.body;
console.log('updateddata',updatedData,req.params)
    try {
        const vehicle = await Vehicle.findByIdAndUpdate( // Use findByIdAndUpdate to update by _id
            id,
            updatedData,
            { new: true } // Return the updated document
        );

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json(vehicle); // Send the updated vehicle data
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOwners = async(req,res)=>{
    try {
        
        const getOwners = await User.find({role:'owner'});
        if(!getOwners){
            return res.status(404).json({
                message:"No Owner Found"
            })
        }
        return res.status(200).json({
            message:"Owners Found",
            Owners: getOwners
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

exports.getETAController = async (req, res) => {
    const { origin, destination } = req.query;
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;  // Replace with your Google API Key
  
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: origin,
          destinations: destination,
          key: apiKey,
        },
      });
      res.json(response.data);
    } catch (error) {
        console.log('error',error.message)
      res.status(500).send({ message: error.message });
    }
  };
  
  exports.addBranch = async (req, res) => {
    try {
      const { name, ownerId } = req.body;
  
      // Step 1: Check if the ownerId exists
      const owner = await User.findById(ownerId);
      if (!owner) {
        return res.status(400).json({ message: "Owner not found" });
      }
  
      // Step 2: Create the new branch
      const newBranch = new Branch({
        name,
        ownerId,
      });
  
      // Step 3: Save the branch to the database
      await newBranch.save();
  
      // Step 4: Populate the owner details and return the branch with owner info
      const populatedBranch = await Branch.findById(newBranch._id)
        .populate('ownerId', 'name email contactNumber'); // Populate only the necessary owner details
  
      // Return the created branch along with owner information
      res.status(201).json({
        message: "Branch added successfully",
        branch: populatedBranch,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding branch", error: error.message });
    }
  };

  exports.getBranches = async (req, res) => {
    try {
        let userId;

        // Check the user's role
        if (req.user.role === 'operator' || req.user.role === 'driver') {
            // If the user is an operator or driver, find branches by their ownerId
            userId = req.user.ownerId;
        } else {
            // If the user is an admin or superadmin, fetch all branches
            userId = req.user._id; // Admins can access all branches (or handle differently if needed)
        }

        let branches;
        
        // If the user is an operator/driver, filter branches by their ownerId
        if (req.user.role === 'operator' || req.user.role === 'driver') {
            branches = await Branch.find({ ownerId: userId });  // Fetch branches by ownerId
        } else {
            // If the user is an admin or superadmin, return all branches
            branches = await Branch.find({ownerId: userId});  // Fetch all branches
        }

        res.status(200).json({ branches });
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Error fetching branches', error: error.message });
    }
};

exports.getVehiclesGroupedByBranch = async (req, res) => {
    try {
        // Fetch all vehicles and populate both branch and owner information
        const vehicles = await Vehicle.find({owner:req.user._id})
            .populate('branchId', 'name location')  // Populate branch details
            .populate('owner', 'name email').populate('driver','name phoneNumber');  // Optionally, populate owner details
console.log('bbb',vehicles)
        // Group vehicles by branchId
        const groupedVehicles = vehicles.reduce((acc, vehicle) => {
            const branchId = vehicle.branchId._id.toString(); // Ensure branchId is a string for grouping

            // Initialize the branch key if it doesn't exist in the accumulator
            if (!acc[branchId]) {
                acc[branchId] = {
                    branch: vehicle.branchId,  // This will store the branch details (e.g., name, location)
                    vehicles: []  // This will store the list of vehicles under this branch
                };
            }
            let totalHours = 0;
            let lastStartedHours = null;  // To track the hours of the last "started" log

            // Loop through the dailyLogs to calculate total working hours
            vehicle.dailyLogs.forEach(log => {
                if (log.status === 'started') {
                    lastStartedHours = log.hours;  // Store the hours for the "started" log
                } else if (log.status === 'ended' && lastStartedHours !== null) {
                    // If the status is "ended" and there's a "started" log before it
                    totalHours += log.hours ;  // Calculate the hours worked for this day
                    lastStartedHours = null;  // Reset lastStartedHours after the "ended" log
                }
            });
            // Add the vehicle to the corresponding branch's vehicles array
            acc[branchId].vehicles.push({
                ...vehicle.toObject(),  // Convert the Mongoose document to a plain JavaScript object
                totalHours  // Add total hours for this vehicle
            });
            return acc;
        }, {});

        // Convert groupedVehicles into an array to return a response
        const response = Object.values(groupedVehicles);

        // Send the response back
        return res.status(200).json({
            message: 'Vehicles grouped by branch fetched successfully.',
            data: response,
            
        });
    } catch (error) {
        console.error('Error fetching vehicles grouped by branch:', error);
        return res.status(500).json({ message: 'Error fetching vehicles grouped by branch.' });
    }
};

exports.startAndEndVehicle = async (req, res) => {
    let { vehicleId, currentMeterReading, vehicleType, actionType } = req.body;
    console.log(req.body);

    try {
        // Convert currentMeterReading to a number
        currentMeterReading = parseFloat(currentMeterReading);

        // Check if the currentMeterReading is a valid number and greater than zero
        if (isNaN(currentMeterReading) || currentMeterReading <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Current meter reading must be a positive number.'
            });
        }

        // Find the vehicle by ID
        const vehicle = await Vehicle.findById(vehicleId);

        // Check if the vehicle exists
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Ensure the vehicle is of type 'others' before starting or ending the trip
        if (vehicle.vehicleType !== 'others') {
            return res.status(400).json({ success: false, message: 'Vehicle type must be "others" to start and end the trip' });
        }

        // Get the current date (for the daily log)
        const currentDate = new Date().setHours(0, 0, 0, 0); // Normalize to midnight to only track the day

        // Check if a log already exists for today
        const existingLog = vehicle.dailyLogs.find(log => new Date(log.date).setHours(0, 0, 0, 0) === currentDate);

        // If the log exists, check the current status of the vehicle
        if (existingLog) {
            if (existingLog.status === 'started' && actionType === 'start') {
                // If the vehicle is already started today and we're trying to start again
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle has already been started today.'
                });
            } else if (existingLog.status === 'ended' && actionType === 'end') {
                // If the vehicle is already ended today and we're trying to end again
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle has already been ended today.'
                });
            }
        }

        // If it's the start of the day (initial reading), set the initial meter
        if (actionType === 'start' && vehicle.vehicleStatus === 'not_started' && !existingLog) {
            vehicle.vehicleStatus = 'started'; // Set status to started

            // Add the start log for today
            vehicle.dailyLogs.push({
                date: currentDate,
                status: 'started',
                hours: currentMeterReading // Initially, no hours worked
            });

            vehicle.createdAt1 = new Date(); // Set the date vehicle was started
            await vehicle.save();

            return res.status(200).json({ success: true, message: 'Vehicle started successfully' });
        }

        // If it's the end of the day (final reading), calculate the total hours for today
        if (actionType === 'end' && existingLog && existingLog.status === 'started') {
            const lastLog = existingLog; // Get the most recent log

            // Ensure that the current meter reading is greater than the previous one
            if (currentMeterReading < lastLog.hours) {
                return res.status(400).json({
                    success: false,
                    message: 'End meter reading cannot be less than start meter reading'
                });
            }
console.log('calculate last liog',currentMeterReading - lastLog.hours)
            // Calculate the total hours for the day
            const totalHoursForTheDay = currentMeterReading - lastLog.hours;
console.log('just test',totalHoursForTheDay)
            // Add the end log for today
            vehicle.dailyLogs.push({
                date: currentDate,
                status: 'ended',
                hours: totalHoursForTheDay
            });

            // Update the vehicle status and total hours
            vehicle.vehicleStatus = 'ended';
            vehicle.updatedAt = new Date(); // Set the date vehicle was updated

            await vehicle.save();

            return res.status(200).json({
                success: true,
                message: `Vehicle completed. Total hours added: ${totalHoursForTheDay}`,
                totalHrs: totalHoursForTheDay
            });
        } else {
            // If no "start" log exists, or if it's not the right day, return an error
            return res.status(400).json({
                success: false,
                message: 'Vehicle must be started before ending the trip.'
            });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};



