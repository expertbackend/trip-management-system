// controllers/notificationController.js
const sendNotification = (userId, message) => {
    // Logic for sending a notification to a user (e.g., via WebSockets)
    console.log(`Notifying user ${userId}: ${message}`);
  };
  
  exports.sendDriverNotification = (req, res) => {
    try {
      const { driverId, message } = req.body;
      sendNotification(driverId, message);
      res.json({ message: "Notification sent to driver" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  