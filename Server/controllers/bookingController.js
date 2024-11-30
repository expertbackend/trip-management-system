const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { getIo } = require('../socket');  // Import the getIo method for Socket.IO instance
const activeSockets = require('../socketStorage');
const { Noti } = require('../models/Notification');
const { Token } = require('../models/Token');
const Notification = require('../tEst/NotificationService');
const mongoose = require('mongoose');

// Helper function to calculate the estimated price
const calculateEstimate = ({ basePay, perKmCharge, kmDriven, halt, tax, toll, discount }) => {
  console.log('basePay, perKmCharge, kmDriven, halt, tax, toll, discount', basePay, perKmCharge, kmDriven, halt, tax, toll, discount)
  let totalFare = basePay + (perKmCharge * kmDriven) + halt;
  let taxAmount = (totalFare * tax) / 100;
  let discountAmount = discount || 0;
  let finalAmount = totalFare + taxAmount + toll - discountAmount;
  console.log('testttttt', totalFare, taxAmount, discountAmount, finalAmount)
  return {
    totalFare,
    taxAmount,
    tollAmount: toll,
    discountAmount,
    finalAmount,
    generatedAt: new Date(),
  };
};
// Function to convert UTC to IST by adding 5 hours 30 minutes (5.5 hours)
function convertToIST(date) {
  const utcDate = new Date(date); // Create a new Date object in UTC
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  return new Date(utcDate.getTime() + IST_OFFSET); // Return new Date object adjusted to IST
}


exports.createBooking = async (req, res) => {
  try {
    const {
      vehicleId,
      pickupLocation,
      dropoffLocation,
      customerName,
      custPhNo,
      custEmailId,
      custAddress,
      startDate,
      endDate,
      kmDriven,
      basePay,
      perKmCharge,
      halt,
      tax,
      toll,
      discount
    } = {
      ...req.body,
      kmDriven: Number(req.body.kmDriven),
      basePay: Number(req.body.basePay),
      perKmCharge: Number(req.body.perKmCharge),
      halt: Number(req.body.halt),
      tax: Number(req.body.tax),
      toll: Number(req.body.toll),
      discount: Number(req.body.discount),
      custPhNo: Number(req.body.custPhNo)
    };

    console.log('req.body', req.body)
    // Convert startDate and endDate to IST
    const startDateIST = convertToIST(startDate);  // Convert to IST
    const endDateIST = convertToIST(endDate);      // Convert to IST

    const userId = req.user._id; // Authenticated user ID (from middleware)

    // Find the vehicle by ID
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Role-based user checks
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let driver = null;  // Initialize driver as null
    let operator = null;  // Initialize operator as null
    let owner = null;  // Initialize owner as null
    let status = 'pending';  // Default status for the booking

    // Determine who is creating the booking and set the relevant fields
    if (user.role === 'driver') {
      // If the driver creates the booking
      owner = user.ownerId;  // Owner is the ID of the associated owner
      driver = userId;  // Driver ID is the authenticated user ID
      status = 'assigned';  // If a driver creates, set the status to 'assigned'

    } else if (user.role === 'operator') {
      // If the operator creates the booking
      const userOwner = await User.findById(user.ownerId);  // Find the associated owner
      if (!userOwner) {
        return res.status(404).json({ message: 'Owner not found' });
      }
      owner = userOwner._id;  // Set owner to the associated owner's ID
      operator = userId;  // Operator ID is the authenticated user ID
      status = 'pending';  // If an operator creates, the status is 'pending'

    } else if (user.role === 'owner') {
      // If the owner creates the booking
      owner = userId;  // The owner is the creator
      operator = null;  // The operator is null initially
      driver = null;  // The driver is null initially
      status = 'pending';  // The status is 'pending' until an operator or driver is assigned
    }

    // Calculate the estimated invoice
    const invoice = calculateEstimate({ basePay, perKmCharge, kmDriven, halt, tax, toll, discount });
    console.log(basePay, perKmCharge, kmDriven, halt, tax, toll, discount)
    const invoiceId = `INV-${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`;
    const pickupLocationGeoJSON = {
      address: pickupLocation.address, // Store the address
      coordinates: {
        type: "Point",
        coordinates: [pickupLocation.lng, pickupLocation.lat], // [longitude, latitude]
      },
    };

    const dropoffLocationGeoJSON = {
      address: dropoffLocation.address, // Store the address
      coordinates: {
        type: "Point",
        coordinates: [dropoffLocation.lng, dropoffLocation.lat], // [longitude, latitude]
      },
    };
    // Create a new booking with the estimated invoice
    const newBooking = new Booking({
      owner,
      operator,
      driver,
      vehicle: vehicleId,
      pickupLocation: pickupLocationGeoJSON,  // Use GeoJSON formatted pickupLocation
      dropoffLocation: dropoffLocationGeoJSON,
      fare: invoice.finalAmount,
      kmDriven,
      status,
      startDate: startDateIST,
      endDate: endDateIST,
      customerName,
      custPhNo,
      custEmailId,
      custAddress,
      basePay,
      perKmCharge,
      halt,
      tax,
      toll,
      discount,
      totalEstimatedAmount: invoice.finalAmount,
      invoice: {  // Store the invoice ID inside the invoice object
        invoiceId: invoiceId,
        totalFare: invoice.totalFare,
        taxAmount: invoice.taxAmount,
        tollAmount: invoice.tollAmount,
        discountAmount: invoice.discountAmount,
        finalAmount: invoice.finalAmount,
        generatedAt: new Date(),
        customerName,
        custPhNo,
        custEmailId,
        custAddress

      },
      customerVerified: false,
    });


    // Save the new booking
    await newBooking.save();
    await Vehicle.findByIdAndUpdate(vehicleId, {
      $push: {
        bookings: {
          bookingId: newBooking._id,
          startDate: startDateIST,
          endDate: endDateIST
        }
      }
    });
    let ownerName = null;
    if (user.role === "owner") {
      // If the user is an owner, fetch their own name
      const owner = await User.findById(user._id);
      if (owner) {
        ownerName = owner.name;  // Extract the name from the User document
      }
    } else {
      // If the user is not an owner, fetch the associated owner's name using user.ownerId
      const owner = await User.findById(user.ownerId);
      if (owner) {
        ownerName = owner.name;  // Extract the name from the User document
      }
    }

    console.log('ownerName', ownerName);

    // Send the booking data along with the estimated invoice back to the frontend
    return res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
      invoice: newBooking.invoice,  // Send invoice details in the response
      ownerName: ownerName
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating booking' });
  }
};



exports.getBookings = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user ID (from middleware)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch bookings based on the role of the user
    let bookings;

    if (user.role === 'owner') {
      // Owners can see their own bookings and bookings of their operators or drivers
      bookings = await Booking.find({
        $or: [
          { owner: userId },  // Bookings where the owner is the creator
          { operator: userId },  // Bookings created by the operator for the owner
          { driver: userId }  // Bookings assigned to the driver
        ]
      })
        .populate('vehicle')   // Populate vehicle details
        .populate('driver');   // Populate driver details
    } else if (user.role === 'operator') {
      // Operators can see bookings created by them (as operator) or bookings where they are a driver
      bookings = await Booking.find({
        $or: [
          { operator: userId },  // Bookings created by the operator
          { driver: userId }  // Bookings assigned to the operator as a driver
        ]
      })
        .populate('vehicle')
        .populate('driver');
    } else if (user.role === 'driver') {
      // Drivers can only see bookings where they are assigned
      bookings = await Booking.find({
        driver: userId
      })
        .populate('vehicle')
        .populate('driver');
    } else {
      return res.status(403).json({ message: 'Unauthorized access' }); // Invalid role access
    }

    return res.status(200).json({
      message: 'Bookings fetched successfully',
      bookings: bookings
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching bookings' });
  }
};


// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle driver');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    return res.status(200).json({ booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while fetching booking.' });
  }
};

// Assign a booking to a driver
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body; // Driver ID from request body
    const owner = await User.findOne({ _id: req.user._id });

    // Validate the driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ message: 'Invalid driver.' });
    }

    console.log('req.params.id', req.params.id);

    // Get the bookings from the request body (it can be an array of booking IDs)
    const bookingIds = req.params.id; // Expecting an array of booking IDs
    const bookings = await Booking.find({ '_id': { $in: bookingIds } }).populate('vehicle');
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found.' });
    }

    // Loop through each booking and check if the driver can be assigned
    for (let booking of bookings) {
      // Ensure the booking is in 'pending' status before assigning a driver
      if (booking.status !== 'pending') {
        return res.status(400).json({ message: `Booking ${booking._id} must be in "pending" status to assign a driver.` });
      }

      // Ensure no driver is assigned yet
      if (booking.driver) {
        return res.status(400).json({ message: `Driver is already assigned to booking ${booking._id}.` });
      }

      // Check if the driver is available (for simplicity, checking overlap of start and end times)
      const isConflict = await Booking.findOne({
        driver: driverId,
        $or: [
          { startDate: { $lte: booking.endDate }, endDate: { $gte: booking.startDate } },
        ]
      });

      if (isConflict) {
        return res.status(400).json({ message: `Driver has a schedule conflict with booking ${booking._id}.` });
      }

      // Update the booking instead of saving it
      await Booking.updateOne(
        { _id: booking._id }, // Find the booking by its ID
        {
          $set: {
            driver: driverId,
            status: 'assigned'
          }
        }
      );

      // Update the driver’s booking list (array of bookings)
      driver.bookings = [...driver.bookings, booking._id];
      await driver.save();

      // Send notification to the driver
      const notificationTitle = "🚗✨ New Booking Assigned!";
      const notificationBody = `🚗 You've got a new booking scheduled for: ${new Date(booking.startDate).toLocaleString()}. Get ready for an exciting ride! 🚙💨`;

      const notification = new Noti({
        userId: driverId,
        title: notificationTitle,
        body: notificationBody,
      });
      await notification.save();

      const io = getIo();
      const socketId = activeSockets.get(driver._id.toString());

      if (socketId) {
        io.to(socketId).emit('bookingAssigned', {
          bookingId: booking._id,
          vehicle: booking.vehicle,
          message: `You have been assigned a new booking!`,
          status: 'assigned',
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log('Driver is not connected to a socket.');
      }

      const deviceToken = await Token.findOne({ userId: driverId });
      if (deviceToken?.token) {
        await Notification.sendNotification(deviceToken.token, notificationTitle, notificationBody);
      }
    }

    return res.status(200).json({ message: 'Driver assigned to this bookings successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while assigning driver.' });
  }
};



exports.startBooking = async (req, res) => {
  try {
    const { startDashboardImage } = req.body;
    console.log('hehehehhe', startDashboardImage)
    // Find the booking by ID and populate the vehicle
    const booking = await Booking.findById(req.params.id).populate('vehicle').populate('driver');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Ensure the booking is in 'assigned' status before starting
    if (booking.status !== 'assigned') {
      return res.status(400).json({ message: 'Booking must be in "assigned" status to start.' });
    }

    // Update the booking's status to 'in-progress'
    booking.status = 'in-progress';
    booking.startDashboardImage = startDashboardImage;
    // Set the startDate to current time
    booking.startDate = new Date();

    // Update the driver's booking status to 'in-progress'
    if (booking.driver) {
      booking.driver.bookingStatus = 'in-progress';  // Update the driver's booking status
      await booking.driver.save();  // Save the updated driver
    }

    // Update the vehicle status to 'running'
    if (booking.vehicle) {
      booking.vehicle.status = 'running';
      await booking.vehicle.save();  // Save the updated vehicle
    }

    // Save the updated booking
    await booking.save();

    return res.status(200).json({ message: 'Booking started successfully.', booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while starting booking.' });
  }
};


exports.endBooking = async (req, res) => {
  try {
    const { kmDriven, extraExpanse, extraExpanseDescription, startDashboardImage } = req.body;  // Updated kilometers driven at the end of the trip
    const booking = await Booking.findById(req.params.id).populate('vehicle').populate('driver');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Ensure the booking is in 'in-progress' status before ending
    if (booking.status !== 'in-progress') {
      return res.status(400).json({ message: 'Booking must be in "in-progress" status to end.' });
    }

    // Use the updated `kmDriven` from the driver, or the existing stored value if not provided
    const distanceTraveled = kmDriven || booking.kmDriven;  // Prefer the provided `kmDriven` value
    const basePay = booking.basePay || 50;  // Use the base fare from booking, defaulting to 50 if not present
    const perKmCharge = booking.perKmCharge || 10;  // Use the per km charge from booking, defaulting to 10 if not present
    const halt = booking.halt || 0;  // Additional halt charge if any

    // Calculate the total fare based on the updated distance and other charges
    let totalFare = basePay + (perKmCharge * distanceTraveled) + halt;

    // Calculate additional charges
    const taxRate = booking.tax || 0;  // Tax rate in percentage (e.g., 10 for 10%)
    const taxAmount = (totalFare * taxRate) / 100;  // Calculate tax as a percentage of the total fare
    const tollAmount = booking.toll || 0;  // Use toll from booking, or default to 0
    const discountAmount = booking.discount || 0;  // Use discount from booking, or default to 0

    // Calculate final fare
    const finalAmount = totalFare + taxAmount + tollAmount - discountAmount;

    // **Total Costs** (including extra expenses):
    const totalCosts = extraExpanse;

    // **Calculate the Profit**:
    const profit = finalAmount - totalCosts;  // Profit = Total Fare - Total Costs

    // Create the invoice object
    const invoice = {
      totalFare,
      taxAmount,
      tollAmount,
      discountAmount,
      finalAmount,
      customerName: booking.customerName,
      custPhNo: booking.custPhNo,
      custEmailId: booking.custEmailId,
      custAddress: booking.custAddress,
      generatedAt: new Date(),
    };

    // Update the booking with the final details
    booking.status = 'completed';  // Mark the booking as completed
    booking.endDate = new Date();  // Set the end date
    booking.kmDriven = distanceTraveled;  // Update the kilometers driven
    booking.invoice = invoice;  // Attach the invoice details
    booking.profit = profit;  // Save the calculated profit in the database
    booking.extraExpanse = extraExpanse;
    booking.extraExpanseDescription = extraExpanseDescription
    // Update the driver's status
    if (booking.driver) {
      booking.driver.bookingStatus = 'completed';
      await booking.driver.save();
    }

    // Update the vehicle status
    if (booking.vehicle) {
      booking.vehicle.status = 'completed';  // Set vehicle status to available after trip completion
      await booking.vehicle.save();
    }
    booking.endDashboardImage = startDashboardImage;
    // Save the updated booking with the profit included
    await booking.save();

    // Respond with the invoice details and profit
    return res.status(200).json({
      message: 'Booking ended successfully.',
      booking,
      invoice,
      profit  // Include profit in the response
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while ending booking.' });
  }
};

// Helper function to convert local time date to UTC
function normalizeDate(date) {
  const newDate = new Date(date);  // Convert to Date object
  newDate.setHours(0, 0, 0, 0);    // Set time to midnight (00:00:00) to ignore the time part
  return newDate;
}
exports.getAvailableDrivers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;  // Get the date (with time) from the query parameter

    // Check if date is provided
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required.' });
    }

    // Normalize the provided date to ignore the time (set time to midnight)
    const selectedDate = normalizeDate(date);

    // Get all drivers for the authenticated user
    const drivers = await User.find({
      ownerId: userId,
      role: 'driver',
    })
      .populate({
        path: 'bookings',  // Populate the bookings field
        select: 'startDate endDate'  // Only include startDate and endDate fields in the populated data
      });

    // Filter drivers who do **not** have bookings overlapping with the selected date & time
    const availableDrivers = drivers.filter(driver => {
      // Check if the driver has any bookings overlapping with the selected date
      const hasBookingOnSelectedDate = driver.bookings.some(booking => {
        // Normalize the startDate and endDate to compare only dates (ignore the time)
        const startDate = normalizeDate(booking.startDate);
        const endDate = normalizeDate(booking.endDate);

        // Check if the selected date is between the startDate and endDate (inclusive)
        return selectedDate >= startDate && selectedDate <= endDate;
      });

      // Return driver if they don't have any booking on the selected date
      return !hasBookingOnSelectedDate;
    });

    if (availableDrivers.length === 0) {
      return res.status(404).json({ message: 'No available drivers found on the selected date.' });
    }

    return res.status(200).json({ drivers: availableDrivers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while fetching available drivers.' });
  }
};


// Get pending bookings
exports.getPendingBookings = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Convert startDate and endDate to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find vehicles that have no bookings overlapping with the requested date range
    const availableVehicles = await Vehicle.find({
      "bookings": {
        $not: {
          $elemMatch: {
            $or: [
              { startDate: { $lte: end }, endDate: { $gte: start } },
              { startDate: { $gte: start }, endDate: { $lte: end } }
            ]
          }
        }
      }
    });

    res.json(availableVehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available vehicles' });
  }
};

const moment = require('moment'); // For date formatting and manipulation
const Tyre = require('../models/Tyre');
const vehicleDocument = require('../models/vehicleDocument');
const vehicleService = require('../models/vehicleService');

exports.myBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if the user is a driver
    const user = await User.findById(userId);
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Only drivers can view this.' });
    }

    // Fetch bookings where the driver is assigned
    const bookings = await Booking.find({ driver: userId })
      .populate('vehicle') // Populate vehicle details
      .populate('driver') // Populate driver details
      .sort({ startDate: 1 }); // Sort bookings by start date

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for the driver.' });
    }

    // Group bookings by day
    const groupedBookings = bookings.reduce((result, booking) => {
      const day = moment(booking.startDate).format('YYYY-MM-DD');
      if (!result[day]) {
        result[day] = [];
      }
      result[day].push(booking);
      return result;
    }, {});

    return res.status(200).json({
      message: 'Bookings fetched successfully.',
      bookings: groupedBookings, // Send bookings grouped by day
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
};

exports.getFinancialSummary = async (req, res) => {
  try {
    const { period } = req.query; // e.g., 'today', 'last7days', 'month'
    let startDate;
    let dates = [];

    // Get the current date and set the start date based on the period
    const today = moment().startOf('day');  // Start of the current day (midnight)
    const last7Days = moment().subtract(7, 'days').startOf('day'); // 7 days ago
    const currentMonthStart = moment().startOf('month');  // Start of the current month (first day)
    const currentMonthEnd = moment().endOf('month');  // End of the current month (last day)

    switch (period) {
      case 'today':
        startDate = today;
        dates = [today.format('YYYY-MM-DD')]; // Single date for today
        break;
      case 'last7days':
        startDate = last7Days;
        dates = Array.from({ length: 7 }, (_, index) => moment().subtract(6 - index, 'days').format('YYYY-MM-DD'));
        break;
      case 'month':
        startDate = currentMonthStart;
        dates = Array.from({ length: currentMonthEnd.date() }, (_, index) =>
          currentMonthStart.clone().add(index, 'days').format('YYYY-MM-DD')
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid period parameter. Use "today", "last7days", or "month".' });
    }
    const userId = req.user._id; // Assuming `req.user` contains the logged-in user's information.
    const userRole = req.user.role; // Role can be 'owner', 'driver', etc.
    const ownerId = req.user.ownerId; // For drivers/operators, the associated owner's ID.

    let ownerFilter = {};
    if (userRole === 'owner') {
      // If the logged-in user is an owner, show data for their bookings
      ownerFilter = { 'owner': userId };
    } else if (userRole === 'driver') {
      // If the logged-in user is a driver, show data for their associated owner's bookings
      ownerFilter = { 'owner': ownerId };
    }
    else if (userRole === 'operator') {
      // If the logged-in user is a driver, show data for their associated owner's bookings
      ownerFilter = { 'owner': ownerId };
    }
    // Fetch the bookings that were completed and have an invoice generated within the specified period
    const bookings = await Booking.aggregate([
      {
        $match: {
          ...ownerFilter,
          status: 'completed',  // Only consider completed bookings
          endDate: { $gte: startDate.toDate() },  // Filter bookings by the start date
        },
      },
      {
        $project: {
          'invoice.finalAmount': 1,
          'invoice.totalFare': 1,
          'invoice.taxAmount': 1,
          'invoice.tollAmount': 1,
          'invoice.discountAmount': 1,
          profit: 1,
          extraExpanse: 1,
          endDate: 1, // Include the end date of each booking
        },
      },
    ]);

    // Initialize totals for the financial data (using arrays to store totals per date)
    let totalFare = Array(dates.length).fill(0); // Initialize with zeros for each date
    let totalTaxAmount = Array(dates.length).fill(0);
    let totalTollAmount = Array(dates.length).fill(0);
    let totalDiscountAmount = Array(dates.length).fill(0);
    let totalProfit = Array(dates.length).fill(0);
    let totalExtraExpanse = Array(dates.length).fill(0);

    // Map bookings to totals by date
    bookings.forEach(booking => {
      const bookingDate = moment(booking.endDate).format('YYYY-MM-DD');
      const dateIndex = dates.indexOf(bookingDate);

      if (dateIndex >= 0) {
        totalFare[dateIndex] += booking.invoice.totalFare || 0;
        totalTaxAmount[dateIndex] += booking.invoice.taxAmount || 0;
        totalTollAmount[dateIndex] += booking.invoice.tollAmount || 0;
        totalDiscountAmount[dateIndex] += booking.invoice.discountAmount || 0;
        totalProfit[dateIndex] += booking.profit || 0;
        totalExtraExpanse[dateIndex] += booking.extraExpanse || 0;
      }
    });

    // Respond with the aggregated data along with dates
    return res.status(200).json({
      message: `Financial summary for ${period}`,
      data: {
        dates, // Include the dates array
        totalFare,
        totalTaxAmount,
        totalTollAmount,
        totalDiscountAmount,
        totalProfit,
        totalExtraExpanse,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving financial summary.' });
  }
};

exports.getVehicleAndDriverList = async (req, res) => {
  try {
    // Fetch all vehicles
    const vehicles = await Vehicle.find({ owner: req.user._id })
      .populate('owner', 'name email')  // Populate owner details
      .populate('driver', 'name email phoneNumber') // Populate driver details
      .exec();

    // Fetch all drivers
    const drivers = await User.find({
      role: 'driver',
      ownerId: req.user._id  // Match the ownerId with the current user's ID
    })
      .select('name email vehicleCount status') // Select the necessary fields
      .exec();

    return res.status(200).json({
      message: 'Vehicle and Driver list fetched successfully',
      data: {
        vehicles,
        drivers,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching vehicle and driver data.' });
  }
};

exports.addDailyExpenses = async (req, res) => {
  try {
    // Get the user ID from the logged-in user (req.user._id)
    const loggedInUserId = req.user._id;

    // Extract other data from the request body
    const { fuelExpanse, driverExpanse, vehicleExpanse, date, driverId, vehicleExpanseDescription } = req.body;

    if (!fuelExpanse && !driverExpanse && !vehicleExpanse) {
      return res.status(404).json({ message: 'At least one expense field must be provided.' });
    }

    // Determine the user ID to update expenses
    let userId;
    if (req.user.role === 'driver') {
      // If logged-in user is a driver, use their own user ID
      userId = loggedInUserId;
    } else if (req.user.role === 'owner' || req.user.role === 'operator') {
      // If logged-in user is an owner/operator, use the provided driver ID
      if (!driverId) {
        return res.status(404).json({ message: 'Driver ID is required when owner/operator is creating expenses for a driver.' });
      }
      userId = driverId; // Owner/operator is creating expense for the driver
    } else {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    // Find the user (driver)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User (driver) not found' });
    }

    // Use provided date or default to today
    const expenseDate = date ? moment(date).startOf('day').toDate() : moment().startOf('day').toDate();

    // Check if expense date is already set for the user
    if (user.expenseDate && !moment(user.expenseDate).isSame(expenseDate, 'day')) {
      return res.status(404).json({ message: 'A single expense date is already set for another day' });
    }

    // Update expenses for the single expense date
    if (fuelExpanse) {
      user.fuelExpanse = [{ date: expenseDate, amount: fuelExpanse }];
    }
    if (driverExpanse) {
      user.driverExpanse = [{ date: expenseDate, amount: driverExpanse }];
    }
    if (vehicleExpanse) {
      user.vehicleExpanse = [{ date: expenseDate, amount: vehicleExpanse }];
    }
    if (vehicleExpanseDescription) {
      user.vehicleExpanseDescription = vehicleExpanseDescription
    }
    // Set the expense date for all expenses
    user.expenseDate = expenseDate;

    // Save updated user data
    await user.save();

    return res.status(200).json({ message: 'Daily expenses updated successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating expenses', error });
  }
};


exports.getExpensesByDriver = async (req, res) => {
  try {
    console.log(req.user)
    let userId;
    req.user.role === "owner" ? userId = req.user._id : req.user.ownerId
    // Fetch all drivers (users with the role 'driver') and select only necessary fields
    const users = await User.find({ role: 'driver', ownerId: userId }, 'name fuelExpanse driverExpanse vehicleExpanse expenseDate vehicleExpanseDescription')
      .populate('vehicle'); // Populate vehicle info if needed (you can remove this if not necessary)
    // If no drivers found
    console.log('users', users.vehicleExpanseDescription)
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No drivers found' });
    }

    // Prepare an array of expenses for each driver
    const driverExpenses = users.map(user => {
      const expenses = [
        ...user.fuelExpanse.map(expense => ({
          expenseType: 'fuel',
          amount: expense.amount,
          date: expense.date
        })),
        ...user.driverExpanse.map(expense => ({
          expenseType: 'driver',
          amount: expense.amount,
          date: expense.date
        })),
        ...user.vehicleExpanse.map(expense => ({
          expenseType: 'vehicle',
          vehicleExpanseDescription: user.vehicleExpanseDescription,
          amount: expense.amount,
          date: expense.date
        }))
      ];

      // Return only the necessary information: driver's name and their expenses
      return {
        driverName: user.name,
        expenses,
        expenseDate: user.expenseDate
      };
    });

    // Return the formatted result
    return res.status(200).json({
      driverExpenses,
      date: users.expenseDate
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching expenses', error });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    // Fetch the drivers based on the logged-in user's ID
    const drivers = await User.find({ ownerId: req.user._id, status: 'active', role: 'driver' });

    if (!drivers || drivers.length === 0) {
      return res.status(404).json({ message: 'No drivers found' });
    }

    res.status(200).json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getTripReports = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, period } = req.query;

    // Validate the required fields
    if (!vehicleId) {
      return res.status(400).json({ error: "Vehicle ID is required." });
    }

    // Construct the query filter
    
    const filter = { vehicle: new mongoose.Types.ObjectId(vehicleId) };
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate) filter.endDate = { ...filter.endDate, $lte: new Date(endDate) };

    const filter1 = { vehicleId: new mongoose.Types.ObjectId(vehicleId) };
    if (startDate) filter1.startDate = { $gte: new Date(startDate) };
    if (endDate) filter1.endDate = { ...filter1.endDate, $lte: new Date(endDate) };
    // Fetch vehicle details
    const vehicle = await Vehicle.findById(vehicleId).populate("owner driver");

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    // Fetch booking data for the trip report
    const bookings = await Booking.find(filter)
      .populate("driver", "name") // Populate driver details
      .sort({ createdAt: -1 }); // Sort by recent bookings
console.log('filter',filter1)
    // Fetch additional expenses
    const tyreExpenses = await Tyre.find(filter).select("tyreAmount");
    const vehicleDocumentExpenses = await vehicleDocument.find(filter1).select("amount");
    const vehicleServiceExpenses = await vehicleService.find(filter1).select("amount");
console.log('tyreExpenses',tyreExpenses,vehicleDocumentExpenses,vehicleServiceExpenses)
    // Calculate aggregated expenses from the additional collections
    const tyreExpenseTotal = tyreExpenses.reduce((acc, tyre) => acc + (tyre.tyreAmount || 0), 0);
    const vehicleDocumentExpenseTotal = vehicleDocumentExpenses.reduce(
      (acc, doc) => acc + (doc.amount || 0),
      0
    );
    const vehicleServiceExpenseTotal = vehicleServiceExpenses.reduce(
      (acc, service) => acc + (service.amount || 0),
      0
    );

    // Aggregate booking data
    const aggregatedData = bookings.reduce(
      (acc, booking) => {
        acc.totalTrips += 1;
        acc.totalFare += booking.fare || 0;
        acc.totalKmDriven += booking.kmDriven || 0;
        acc.extraExpenses += booking.extraExpanse || 0;
        acc.totalProfit += booking.profit || 0;
        return acc;
      },
      { totalTrips: 0, totalFare: 0, totalKmDriven: 0, extraExpenses: 0, totalProfit: 0 }
    );
console.log('tyreExpenseTotal',tyreExpenseTotal,vehicleDocumentExpenseTotal,vehicleServiceExpenseTotal)
    // Calculate "Other Expenses"
    const otherExpenses =
      
      tyreExpenseTotal +
      vehicleDocumentExpenseTotal +
      vehicleServiceExpenseTotal;

    // Construct detailed booking reports
    const detailedBookings = bookings.map((booking) => ({
      bookingId: booking._id,
      driverName: booking.driver?.name || "N/A",
      tripDate: booking.startDate,
      fare: booking.fare,
      kmDriven: booking.kmDriven,
      extraExpenses: booking.extraExpanse,
      profit: booking.profit,
    }));

    // Construct the response
    const report = {
      period: period || "N/A",
      vehicleName: vehicle.name,
      plateNumber: vehicle.plateNumber,
      totalTrips: aggregatedData.totalTrips,
      totalFare: aggregatedData.totalFare,
      totalKmDriven: aggregatedData.totalKmDriven,
      otherExpenses, // Consolidated other expenses
      bookings: detailedBookings,
    };

    // Respond with the aggregated data and detailed bookings
    return res.status(200).json({ report });
  } catch (error) {
    console.error("Error fetching trip reports:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // Find booking by ID
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the booking status is "completed" or "in progress"
    if (booking.status === "completed" || booking.status === "in-progress") {
      return res.status(400).json({ message: "Booking is either completed or in progress and cannot be cancelled" });
    }

    // Update the status to "cancelled"
    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};
