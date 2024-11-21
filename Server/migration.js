const mongoose = require('mongoose');
const User = require('./models/User'); // Assuming User is the model with planId field

async function migratePlanId() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect('mongodb+srv://kuleswariexpertsolutions:w5F2FkJHr8TKnOyU@cluster0.unm3o.mongodb.net/taxi-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to the database');

    // Find the document that contains the planId field
    const user = await User.findOne({ planId: { $exists: true, $ne: null } });

    if (!user) {
      console.log('No user with planId field found.');
      return;
    }

    // Add the specific planId to the planIds array
    const planIdToAdd = new mongoose.Types.ObjectId('673db5225d92a1fff41da0cf'); // ID to add to planIds array
    user.planIds = user.planIds || [];  // Ensure the planIds array exists
    if (!user.planIds.includes(planIdToAdd)) {
      user.planIds.push(planIdToAdd); // Add the planId if it is not already in the array
    }

    // Remove the old planId field
    user.planId = undefined; // Remove the old planId field

    // Save the updated document
    await user.save();
    console.log(`User ${user._id} updated with planIds array: ${user.planIds}`);

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.disconnect();
  }
}

migratePlanId();
