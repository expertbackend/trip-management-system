const cron = require('node-cron');
const Reminder = require('./models/Remainder'); // Assuming Reminder model is imported
const vehicleDocument = require('./models/vehicleDocument'); // Assuming vehicleDocument model is imported
const activeSockets = require('./socketStorage'); // Assuming activeSockets keeps track of connected clients
const { getIo } = require('./socket');
const io = getIo();
     
// Schedule cron job every 10 seconds for demonstration, you can adjust the cron time accordingly
cron.schedule("*/10 * * * * *", async () => {
  const today = new Date();
  console.log("Running cron job at:", today);

  try {
    // Iterate through the active sockets to send reminders to each connected user
    for (const [userId, socketId] of activeSockets.entries()) {
      // Fetch reminders from the database where reminderDate is less than or equal to today and userId matches
      const reminders = await vehicleDocument.find({
        reminderDate: { $lte: today },
        userId: userId, // Use the userId to get reminders specific to the user
      }).populate('vehicleId');

      console.log('Fetched reminders for user:', userId, reminders);

      // Send reminders to the client via Socket.IO
      reminders.forEach(async (reminder) => {
        // Create a stylish reminder message
        const reminderData = {
          type: "reminder",
          message: `🚗 **Reminder for Your Vehicle!** 🚗\n
            **Vehicle Number:** ${reminder.vehicleId.plateNumber}\n
            **Document Type:** ${reminder.documentType}\n
            **Reminder Date:** ${reminder.reminderDate.toLocaleDateString()}\n
            ⚠️ Your ${reminder.documentType} will expire soon! Please make sure to renew it before the expiration date.\n
            📅 **Expiry Date:** ${reminder.expiryDate.toLocaleDateString()}\n
            🔧 Stay Safe on the Road! 🛠️`
        };
        const socketId = activeSockets.get(userId.toString());
        // Send the reminder message via Socket.IO
        if (socketId) {
          io.to(socketId).emit('reminder', reminderData); // Send the message
          console.log(`Sent reminder to client with userId: ${userId}`);
        }

        // Now save the reminder to the database for the Announcement page
        const newReminder = new Reminder({
          userId: userId,
          vehicleId: reminder.vehicleId,
          document: reminder._id,  // Link to the vehicle document
          reminderMessage: reminderData.message,
          reminderDate: reminder.reminderDate, // Use the same reminder date
          status: 'pending', // Set status to 'pending' initially
        });

        // Save the reminder to the database
        await newReminder.save();
        console.log('Saved reminder to the database for user:', userId);
      });
    }
  } catch (error) {
    console.error("Error broadcasting reminders:", error);
  }
});
