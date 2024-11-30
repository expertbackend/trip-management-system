const WebSocket = require("ws");
const mongoose = require("mongoose");
const cron = require("node-cron");
const vehicleDocument = require("./models/vehicleDocument"); // Assuming this file exists in your project
const Reminder = require("./models/Remainder");

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store WebSocket clients and their tokenId
const clients = new Map();

// Handle WebSocket connection
wss.on('connection', (ws) => {
  console.log("Client connected");

  // Handle 'register' event from the client
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register' && data.tokenId) {
      // Store the tokenId in the WebSocket connection object
      ws.tokenId = data.tokenId;
      
      // Store the WebSocket client with their tokenId
      clients.set(ws.tokenId, ws);

      // Log client tokenId (clientId) when the 'register' event is triggered
      console.log(`Client registered with tokenId: ${data.tokenId}`);

      // You can send a confirmation message back to the client (optional)
      ws.send(JSON.stringify({ type: 'register', message: 'Token registered successfully' }));
    }
  });

  // Handle WebSocket disconnections
  ws.on('close', () => {
    if (ws.tokenId) {
      clients.delete(ws.tokenId); // Remove the client from the map when disconnected
      console.log(`Client with tokenId ${ws.tokenId} disconnected`);
    }
  });
});

// Cron job to send reminders every 5 seconds
cron.schedule("*/10 * * * * *", async () => {
  const today = new Date();
  console.log("Running cron job at:", today);

  try {
    // Iterate through the clients map to send reminders to each user
    for (const [userId, client] of clients) {
      // Fetch reminders from the database where reminderDate is less than or equal to today and userId matches
      const reminders = await vehicleDocument.find({
        reminderDate: { $lte: today },
        userId: userId, // Use the tokenId as userId
      }).populate('vehicleId');

      console.log('Fetched reminders:', reminders);

      // Send reminders to the client
      reminders.forEach(async (reminder) => {
        // Create a stylish reminder message
        const reminderData = {
          type: "reminder",
          message: `
            🚗 **Reminder for Your Vehicle!** 🚗

            **Vehicle Number:** ${reminder.vehicleId.plateNumber}
            **Document Type:** ${reminder.documentType}
            **Reminder Date:** ${reminder.reminderDate.toLocaleDateString()}

            ⚠️ Your ${reminder.documentType} will expire soon! Please make sure to renew it before the expiration date.

            📅 **Expiry Date:** ${reminder.expiryDate.toLocaleDateString()}

            🔧 Stay Safe on the Road! 🛠️
          `
        };

        // Check if the WebSocket client is still open and send the reminder
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(reminderData));
          console.log(`Sent reminder to client with tokenId: ${userId}`);
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

// Log the WebSocket server is running
console.log("WebSocket server running on ws://localhost:8080");
