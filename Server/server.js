// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Location = require('./models/Location');
const User = require('./models/User');
const ownerRoutes = require('./routes/ownerRoutes');
const bookingRoute = require('./routes/bookingRoutes');
const app = express();
const { initializeIo } = require('./socket'); 
const server = http.createServer(app);
const activeSockets = require('./socketStorage');
const io = initializeIo(server);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   },
// });
// const socketHandlers = socketServer(server);


app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://kuleswariexpertsolutions:w5F2FkJHr8TKnOyU@cluster0.unm3o.mongodb.net/taxi-service", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if the connection fails
  }
};

connectDB();
app.use('/api/owner', ownerRoutes);
// Middleware to authenticate Socket.IO connections
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Unauthorized: No token provided'));
  }

  try {
    const verified = jwt.verify(token,"hahahahahahahyoudontknowre"); // Use environment variable for the secret
    const user = await User.findById(verified.id).populate('role');

    if (!user) {
      return next(new Error('Unauthorized: User not found'));
    }

    socket.userId = user._id.toString();
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return next(new Error('Unauthorized: Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;

  activeSockets.set(userId, socket.id);



  socket.on('sendLocation', async (data) => {
    const userId = socket.userId;
    socket.broadcast.emit('changeLocation', { userId, latitude: data.latitude, longitude: data.longitude });
    const location = new Location({
      userId,
      location: {
        type: 'Point', // Specify the type as 'Point'
        coordinates: [data.longitude, data.latitude], // Note: Coordinates should be [longitude, latitude]
      },
    });
  
    try {
      await location.save();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  });
  // socket.emit('newNotification', {
  //   title: 'Notification Title',
  //   body: 'Notification Body',
  //   timestamp: new Date().toISOString(),
  // });

  socket.on('disconnect', () => {
    activeSockets.delete(userId);

    console.log('User disconnected:', socket.id);
  });
});
const userRoute = require('./routes/authroute');
app.use('/api/users',userRoute);
app.use('/api/booking',bookingRoute)
app.get('/',async(req,res)=>{
  res.send('API Server is working fine............ ')
})
// API routes
app.get('/api/drivers/:userId/history', async (req, res) => {
  const { userId } = req.params;

  try {
    const locations = await Location.find({ userId }).sort({ createdAt: 1 }); // Sort by time
    res.json(locations);
  } catch (error) {
    console.error('Error retrieving location history:', error);
    res.status(500).json({ message: 'Error retrieving location history' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('name');
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).send('Server error');
  }
});
const fireBaseRoutes = require('./routes/notificationRoutes');
const Notification = require('./tEst/NotificationService');
app.use('/api/firebase',fireBaseRoutes)
// app.get('/',(req,res)=>{
//     res.json({
//         "message":"working fine"
//     })
// })
// Start the server
const PORT =  4001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = io;
