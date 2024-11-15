const admin = require('firebase-admin');
const serviceAccount = require('./notification-project-a34db-firebase-adminsdk-uejfo-09445f18d6.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
module.exports = admin;
