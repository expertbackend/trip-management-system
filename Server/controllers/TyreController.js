const Booking = require("../models/Booking");
const Reminder = require("../models/Remainder");
const Tyre = require("../models/Tyre");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const vehicleDocument = require("../models/vehicleDocument");
const vehicleService = require("../models/vehicleService");


// Register a new tyre
exports.registerTyre = async (req, res) => {
    const { tyreBrand,tyreSerielNo,tyreAmount,purchaseFrom, vehicleId, tyrePosition, tyreMileage, installedAtKm } = req.body;
let ownerId;
if (req.user.role === 'owner') {
  ownerId = req.user._id;
} else {
  ownerId = req.user.ownerId;
}
    try {
        // Check if the vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        // Create the tyre
        const tyre = new Tyre({
            tyreBrand,
            vehicle: vehicleId,
            tyrePosition,
            tyreMileage,
            installedAtKm,
            tyreSerielNo,
            tyreAmount,
            purchaseFrom,
            ownerId:ownerId
        });

        await tyre.save();
        res.status(201).json({ message: 'Tyre registered successfully', tyre });
    } catch (error) {
console.log('error',error.message)
        res.status(500).json({ error: 'Error registering tyre', details: error.message });
    }
};

// Check tyre status
exports.checkTyreStatus = async (req, res) => {
    const { vehicleId, tyrePosition } = req.params;
    const { currentKm } = req.query;

    try {
        const tyre = await Tyre.findOne({ vehicle: vehicleId, tyrePosition }).populate('vehicle');
        if (!tyre) {
            return res.status(404).json({ error: 'Tyre not found' });
        }
        

        const kmDriven = currentKm - tyre.installedAtKm;
        if(currentKm<tyre.installedAtKm){
            return res.status(200).json({
                message:"you can not add kmdriven lessthen your installed km"
            })
        }
        const remainingLife = tyre.tyreMileage - kmDriven;

        res.status(200).json({
            message:"fetch successfull",
            tyreName: tyre.tyreBrand,
            vehicle: tyre.vehicle.plateNumber,
            tyrePosition: tyre.tyrePosition,
            kmDriven,
            remainingLife: remainingLife > 0 ? remainingLife : 0,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error checking tyre status', details: error.message });
    }
};

exports.getAllTyres = async (req, res) => {
    try {
      let ownerId;
      if (req.user.role === 'owner') {
        ownerId = req.user._id;
      } else {
        ownerId = req.user.ownerId;
      }
        // Fetch all tyres with vehicle information
        const tyres = await Tyre.find({ownerId:ownerId})
            .populate('vehicle', 'plateNumber') // Populates vehicle plate number
            .sort({ createdAt: -1 }); // Optional: Sort by most recently created

        // Return tyres in a structured response
        res.status(200).json({
           message:"Data fetch successfully",
           data:tyres
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tyres', details: error.message });
    }
};

exports.createVehicleDocument = async (req, res) => {
    try {
      let userId;
      if (req.user.role === 'owner') {
        userId = req.user._id;
      } else {
        userId = req.user.ownerId;
      }
      const { vehicleId, documentType, expiryDate, reminderDate, description,amount,isDailyReminder } = req.body;
      const document = new vehicleDocument({
        vehicleId,
        documentType,
        expiryDate,
        reminderDate,
        description,
        amount,
        isDailyReminder,
        userId
      });
      await document.save();
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  exports.getVehicleDocuments = async (req, res) => {
    try {
      const { vehicleId } = req.query; // Optional filter by vehicleId
      let userId;
      
      // Determine the userId based on role
      if (req.user.role === 'owner') {
        userId = req.user._id;
      } else {
        userId = req.user.ownerId;
      }
      
      // Build the query
      const query = { userId: userId }; // Include userId in the query
      if (vehicleId) {
        query.vehicleId = vehicleId; // Add vehicleId filter if provided
      }
      console.log('query',query)
      // Fetch documents and populate vehicleId
      const documents = await vehicleDocument.find(query).populate('vehicleId');
      console.log('doc',documents)
      // Return the response
      res.status(200).json( documents );
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  exports.updateVehicleDocument = async (req, res) => {
    try {
      const { documentId } = req.params; // Extract the document ID from the request params
      const { vehicleId, documentType, expiryDate, reminderDate, description, amount, isDailyReminder } = req.body;
  
      // Find the document by its ID and update with the new data
      const updatedDocument = await vehicleDocument.findByIdAndUpdate(
        documentId,
        {
          vehicleId,
          documentType,
          expiryDate,
          reminderDate,
          description,
          amount,
          isDailyReminder,
        },
        { new: true, runValidators: true } // Return the updated document and validate inputs
      );
  
      if (!updatedDocument) {
        return res.status(404).json({ error: "Vehicle document not found" });
      }
  
      res.status(200).json(updatedDocument);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };  


exports.createVehicleService = async (req, res) => {
  try {
    let userId;
      if (req.user.role === 'owner') {
        userId = req.user._id;
      } else {
        userId = req.user.ownerId;
      }
    const { vehicleId, serviceType, serviceDate, odometerReading, amount, companyName, description,servicingMileage
    } = req.body;
    const service = new vehicleService({
      vehicleId,
      serviceType,
      serviceDate,
      odometerReading,
      amount,
      companyName,
      description,
      servicingMileage,
      userId

    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllVehicleServices = async (req, res) => {
  try {
    let userId;
    if (req.user.role === 'owner') {
      userId = req.user._id;
    } else {
      userId = req.user.ownerId;
    }
    const services = await vehicleService.find({userId:userId}).populate('vehicleId'); // Retrieve all services from the vehicleService collection
    res.status(200).json(services); // Send the services as the response
  } catch (error) {
    res.status(400).json({ error: error.message }); // If an error occurs, return a 400 response
  }
};


exports.calculateProfit = async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query; // Get date filter from query params

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'owner') {
      return res.status(403).json({ error: 'You must be an owner to access this' });
    }

    const vehicles = await Vehicle.find({ owner: userId });
    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'No vehicles found for this owner' });
    }

    let totalProfit = 0;
    let totalReceivedAmount = 0; // New variable to keep track of received amounts
    let expensesData = [];
    let totalExpenses = 0;

    // Initialize an object to store expenses by category
    const expensesByCategory = {};

    // Parse start and end dates if available
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    // Use Promise.all to handle vehicle-related queries concurrently
    const vehiclePromises = vehicles.map(async (vehicle) => {
      let vehicleProfit = 0;
      let tyreExpense = 0;
      let vehicleDocumentExpense = 0;
      let vehicleServiceExpense = 0;

      let vehicleReceivedAmount = 0; // Track received amount per vehicle

      // Get bookings for this vehicle
      const bookings = await Promise.all(
        vehicle.bookings.map(async (bookingRef) => {
          const booking = await Booking.findById(bookingRef.bookingId);
          return booking;
        })
      );

      // Loop through vehicle bookings
      bookings.forEach(booking => {
        if (booking && booking.status === 'completed') {
          // Check if the booking falls within the date range
          const bookingStartDate = new Date(booking.startDate);
          const bookingEndDate = new Date(booking.endDate);

          const isInDateRange =
            (!parsedStartDate || bookingStartDate >= parsedStartDate) &&
            (!parsedEndDate || bookingEndDate <= parsedEndDate);

          if (isInDateRange) {
            vehicleProfit += booking.profit || 0;
            vehicleReceivedAmount += booking.invoice.finalAmount || 0; // Add finalAmount to the received amount
          }
        }
      });

      // Get expenses data for this vehicle concurrently
      const [tyres, vehicleDocuments, vehicleServices] = await Promise.all([
        Tyre.find({ vehicle: vehicle._id }),
        vehicleDocument.find({ vehicleId: vehicle._id }),
        vehicleService.find({ vehicleId: vehicle._id })
      ]);

      // Filter tyres based on date range
      tyres.forEach(tyre => {
        const tyreDate = new Date(tyre.createdAt); // assuming Tyre has a `createdAt` field
        if (
          (!parsedStartDate || tyreDate >= parsedStartDate) &&
          (!parsedEndDate || tyreDate <= parsedEndDate)
        ) {
          tyreExpense += tyre.tyreAmount || 0;
        }

        // Add tyre expense to its category
        expensesByCategory['Tyre'] = (expensesByCategory['Tyre'] || 0) + tyre.tyreAmount || 0;
      });

      // Filter vehicle documents based on expiryDate (or createdAt if necessary)
      vehicleDocuments.forEach(doc => {
        const docExpiryDate = new Date(doc.expiryDate); // assuming VehicleDocument has an `expiryDate`
        if (
          (!parsedStartDate || docExpiryDate >= parsedStartDate) &&
          (!parsedEndDate || docExpiryDate <= parsedEndDate)
        ) {
          vehicleDocumentExpense += doc.amount || 0;
        }

        // Add document expense to its category
        expensesByCategory['Document'] = (expensesByCategory['Document'] || 0) + doc.amount || 0;
      });

      // Filter vehicle services based on serviceDate
      vehicleServices.forEach(service => {
        const serviceDate = new Date(service.serviceDate); // assuming VehicleService has a `serviceDate`
        if (
          (!parsedStartDate || serviceDate >= parsedStartDate) &&
          (!parsedEndDate || serviceDate <= parsedEndDate)
        ) {
          vehicleServiceExpense += service.amount || 0;
        }

        // Add service expense to its category
        expensesByCategory['Service'] = (expensesByCategory['Service'] || 0) + service.amount || 0;
      });

      // Add expenses data for this vehicle
      expensesData.push({
        vehicleId: vehicle._id,
        tyreExpense,
        vehicleDocumentExpense,
        vehicleServiceExpense,
      });

      // Calculate final profit for the vehicle
      const finalProfit = vehicleProfit;
      totalProfit += finalProfit;

      // Accumulate total expenses
      totalExpenses += tyreExpense + vehicleDocumentExpense + vehicleServiceExpense;

      // Add the vehicle's received amount to the total received amount
      totalReceivedAmount += vehicleReceivedAmount;
    });

    // Wait for all vehicles to be processed
    await Promise.all(vehiclePromises);

    // Send the response back
    return res.status(200).json({
      totalBookingProfit: totalProfit,
      finalProfit: totalProfit - totalExpenses,  // Assuming this is the final calculation
      totalReceivedAmount,  // Send the total received amount
      expensesData,
      expensesByCategory,  // Send categorized expenses
      totalExpenses
    });
  } catch (error) {
    console.error('Error calculating profit:', error);
    res.status(500).json({ error: 'Error calculating profit', details: error.message });
  }
};


exports.getReminders = async (req, res) => {
  try {

const userId = req.user._id
    // Build query object based on filters
    const query = {};
    if (userId) query.userId = userId;  // Filter reminders by user ID
console.log('query',query)
    // Fetch all reminders matching the query
    const reminders = await Reminder.find(query)
     

    if (reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found' });
    }

    // Respond with the list of reminders
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Optionally, you can have a method to get a single reminder by ID
exports.getReminderById = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id)
      .populate('userId', 'name email')
      .populate('vehicleId', 'make model')
      .populate('document', 'title');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






