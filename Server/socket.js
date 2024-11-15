let io; // Define io without initializing it immediately

// Function to initialize io
const initializeIo = (serverInstance) => {
  if (io) return io; // Prevent reinitialization if already done

  const { Server } = require('socket.io');
  io = new Server(serverInstance, {
    cors: {
      origin: process.env.FRONTEND_URL || 'https://trip-management-system-1.onrender.com',
      methods: ['GET', 'POST'],
    },
  });

  return io;
};

// Function to get the io instance
const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized yet!');
  }
  return io;
};

module.exports = { initializeIo, getIo };