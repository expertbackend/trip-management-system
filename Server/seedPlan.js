const mongoose = require('mongoose');
const Plan = require('./models/Plan'); // Path to your Plan model
const User = require('./models/User')
require('dotenv').config();
const seedPlans = async () => {
    try {
        // Connect to your MongoDB instance (make sure MongoDB is running)
        await mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

        // Check if the plans already exist to avoid duplication
        const existingPlans = await Plan.find();
        if (existingPlans.length > 0) {
            console.log('Plans already exist in the database.');
            return;
        }

        // Create the dummy plans
        const plans = [
            {
                name: 'Basic Plan',
                description: 'Ideal for small businesses with a few vehicles.',
                price: 400,
                maxVehicles: 2,
                duration:10
            },
            {
                name: 'Standard Plan',
                description: 'Great for growing businesses with moderate vehicle needs.',
                price: 600,
                maxVehicles: 3,
                duration:10
            },
            {
                name: 'Premium Plan',
                description: 'Perfect for businesses with a large fleet of vehicles.',
                price: 1000,
                maxVehicles: 5,
                duration:10
            },
            {
                name: 'Enterprise Plan',
                description: 'Best for companies with a large fleet and custom needs.',
                price: 2000,
                maxVehicles: 10,
                duration:10
            },
        ];

        // Insert the plans into the database
        await Plan.insertMany(plans);
        console.log('Dummy plans have been added to the database.');

        // Close the database connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding plans:', error);
    }
};

// Run the seeding function
// seedPlans();
const Permission = require('./models/Permission');
const Vehicle = require('./models/Vehicle');

async function createPermissions() {
    try {
        // Connect to the database
        await mongoose.connect(process.env.DB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Permissions array
        const permissions = [
            // { name: 'create', resource: 'vehicle', description: 'Create new vehicles' },
            // { name: 'read', resource: 'vehicle', description: 'Read vehicle data' },
            // { name: 'edit', resource: 'vehicle', description: 'Edit vehicle data' },
            // { name: 'delete', resource: 'vehicle', description: 'Delete a vehicle' },
            // { name: 'create', resource: 'user', description: 'Create new users' },
            // { name: 'read', resource: 'user', description: 'Read user data' },
            // { name: 'edit', resource: 'user', description: 'Edit user data' },
            // { name: 'delete', resource: 'user', description: 'Delete a user' },
            // { name: 'create', resource: 'plan', description: 'Create new plans' },
            // { name: 'read', resource: 'plan', description: 'Read plan data' },
            // { name: 'edit', resource: 'plan', description: 'Edit plan data' },
            // { name: 'delete', resource: 'plan', description: 'Delete a plan' },
            // { name: 'create', resource: 'booking', description: 'Create new bookings' },
            // { name: 'read', resource: 'booking', description: 'Read booking data' },
            // { name: 'edit', resource: 'booking', description: 'Edit booking data' },
            // { name: 'delete', resource: 'booking', description: 'Delete a booking' },
            { name: 'create', resource: 'expense', description: 'Create new expenses' },
            { name: 'read', resource: 'expense', description: 'Read expense data' },
            { name: 'edit', resource: 'expense', description: 'Edit expense data' },
            { name: 'delete', resource: 'expense', description: 'Delete a expense' },
        ];

        // Iterate over permissions array and insert each permission into the database
        for (const permission of permissions) {
            // Check if permission already exists in the database
            const existingPermission = await Permission.findOne({
                name: permission.name,
                resource: permission.resource,
            });

            if (!existingPermission) {
                await Permission.create(permission);
                console.log(`Permission created: ${permission.name} on ${permission.resource}`);
            } else {
                console.log(`Permission already exists: ${permission.name} on ${permission.resource}`);
            }
        }

        // Close database connection
        await mongoose.connection.close();
        console.log('Permissions seeding completed successfully.');
    } catch (error) {
        console.error('Error creating permissions:', error);
        // Ensure connection is closed in case of error
        await mongoose.connection.close();
    }
}


// Run the seeder function
// createPermissions();
const addPhoneNumberToUsers = async () => {
    const MONGO_URI = process.env.DB_CONNECTION_STRING;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected.'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));
    try {
      const result = await User.updateMany(
        { phoneNumber: { $exists: true } }, // Target only documents without the field
        { $set: { phoneNumber: '7978394726' } } // Add the `phoneNumber` field with a default value of `null`
      );
  
      console.log(`Updated ${result.modifiedCount} users with phoneNumber field.`);
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      // Close the MongoDB connection
      mongoose.connection.close();
    }
  };
  
  // Execute the function
//   addPhoneNumberToUsers();
const updateTimestamps = async () => {
    const MONGO_URI = process.env.DB_CONNECTION_STRING;
  
    // Connect to MongoDB
    mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('MongoDB connected.'))
      .catch((error) => console.error('Error connecting to MongoDB:', error));
  
    try {
      const currentDate = new Date();
  
      const result = await Vehicle.updateMany(
        {}, // Match all documents
        {
          $set: {
            updatedAt: currentDate,
            createdAt: currentDate, // Update createdAt as well
          },
        }
      );
  
      console.log(`${result.modifiedCount} documents updated with new timestamps.`);
    } catch (error) {
      console.error('Error updating timestamps:', error);
    } finally {
      mongoose.connection.close();
    }
  };
  
  // Run the update function
  updateTimestamps();