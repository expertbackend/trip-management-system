const express = require('express');
const { createBooking, getBookings, getBookingById, assignDriver, startBooking, endBooking, getPendingBookings, getAvailableDrivers, myBookings, getFinancialSummary, getVehicleAndDriverList, addDailyExpenses, getExpensesByDriver, getAllDrivers, getTripReports, cancelBooking, createLoadingDetails, updateLoadingDetails, updateUnloadingDetails, getRemainingAmount, getCompletedBookings, updateBooking, trackAction, getUserProgress, getUserLeaderboard } = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');
const  roleCheck = require('../middlewares/roleMiddleware'); // Import the roleCheck middleware
const {hasPermission} = require('../middlewares/permissions'); // Import the hasPermission middleware
const { addExpense } = require('../controllers/expenseController');

const router = express.Router();
router.use(authMiddleware);

// Create a new booking (only 'owner' and 'operator' can create bookings)
router.post('/bookings', roleCheck(['owner', 'operator','driver']), hasPermission('create', 'booking'), createBooking);
router.get('/completedbookings', roleCheck(['owner', 'operator','driver']), hasPermission('read', 'booking'), getCompletedBookings);

router.get('/drivers', roleCheck(['owner', 'operator','driver']), hasPermission('read', 'user'), getAvailableDrivers);
router.get('/pending-bookings', roleCheck(['owner', 'operator','driver']), hasPermission('read', 'booking'), getPendingBookings);

// Get a list of bookings for the authenticated user (owner)
router.get('/bookings', roleCheck(['owner', 'operator','driver']),hasPermission('read', 'booking'), getBookings);
router.get('/bookings1', roleCheck(['driver']), myBookings);

// Get a booking by ID (only 'owner' and 'operator' can read bookings)
router.get('/bookings/:id', roleCheck(['owner', 'operator','driver']),hasPermission('read', 'booking'), getBookingById);

// Assign a driver to a booking (only 'owner' and 'operator' can assign a driver)
router.put('/bookings/:id/assign-driver', roleCheck(['owner', 'operator','driver']), hasPermission('edit', 'booking'), assignDriver);

router.put('/start/:id',roleCheck(['owner', 'operator','driver']), hasPermission('edit', 'booking'), startBooking);

// Route to end booking
router.put('/end/:id',roleCheck(['owner', 'operator','driver']), hasPermission('edit', 'booking'), endBooking);
router.post('/expanse',roleCheck(['owner', 'operator','driver']), hasPermission('create', 'expense'),addExpense);
router.get('/financial-summary',roleCheck(['owner', 'operator','driver']), getFinancialSummary);
router.get('/vehicle-driver-list',roleCheck(['owner', 'operator','driver']), getVehicleAndDriverList);
router.put('/add-daily-expanse',roleCheck(['owner', 'operator','driver']), addDailyExpenses);
router.get('/view-expanse',roleCheck(['owner', 'operator','driver']), getExpensesByDriver);
router.get('/alldrivers',roleCheck(['owner', 'operator','driver']), getAllDrivers);
router.get('/reports/trips',roleCheck(['owner', 'operator','driver']), getTripReports);
router.delete('/bookings/:id',roleCheck(['owner', 'operator','driver']), cancelBooking);
// Create loading details
router.post('/booking/:id/loading',roleCheck(['owner', 'operator','driver']), createLoadingDetails);

// Update loading details
router.put('/booking/:id/loading',roleCheck(['owner', 'operator','driver']), updateLoadingDetails);
router.put('/bookings/:bookingId',roleCheck(['owner', 'operator','driver']), updateBooking);

// Update unloading details
router.post('/booking/:id/unloading',roleCheck(['owner', 'operator','driver']), updateUnloadingDetails);
router.get('/booking/:bookingId',roleCheck(['owner', 'operator','driver']), getRemainingAmount);
router.post('/trackAction',roleCheck(['owner', 'operator','driver']), trackAction);
router.get('/progress/:userId', getUserProgress);
router.get('/leaderboard', getUserLeaderboard);

module.exports = router;
