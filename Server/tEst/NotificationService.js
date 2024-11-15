const admin = require('./firebase'); // Firebase Admin SDK

class Notification {
  // Set the io instance from the main server
  static setSocketIO(socketIOInstance) {
    io = socketIOInstance;
  }

  static async sendNotification(deviceToken, title, body) {
    console.log(deviceToken, title, body);
    const message = {
      notification: {
        title,
        body
      },
      token: deviceToken
    };

    try {
      // Send the Firebase notification
      await admin.messaging().send(message);

     
    } catch (error) {
      console.error("Error Sending Notification", error);
    }
  }
}

module.exports = Notification;
