const express = require('express');
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleCheck = require('../middlewares/roleMiddleware');
const { hasPermission } = require('../middlewares/permissions');
const { createUser, getAllUsers, updateUser, toggleUserStatus } = require('../controllers/authController');

const router = express.Router();

// Middleware for owner authentication
router.use(authMiddleware); // Apply this to all owner routes

router.post('/buy-plan',roleCheck(['owner']), ownerController.buyPlan);
router.get('/plan-history',roleCheck(['owner']), ownerController.getPlanHistory);
router.get('/payment-requests', ownerController.getAllPaymentRequests);

// PATCH - Approve a payment request
router.patch('/payment-requests/:id/approve', ownerController.approvePaymentRequest);

// PATCH - Reject a payment request
router.patch('/payment-requests/:id/reject', ownerController.rejectPaymentRequest);
router.post('/add-vehicle',roleCheck(['owner','operator']),hasPermission('create', 'vehicle'), ownerController.addVehicle);
// router.post('/create-user',roleCheck(['owner','operator']),hasPermission('create', 'user'), ownerController.createUser);
router.post('/assign-vehicle',roleCheck(['owner','operator']),hasPermission('create', 'vehicle'), ownerController.assignVehicleToDriver);
router.post('/assign-permissions',roleCheck(['owner']), ownerController.assignPermissions);
router.post('/createUser',roleCheck(['owner','operator']), createUser);
router.get('/users',roleCheck(['owner','operator']),hasPermission('read', 'user'), getAllUsers);
router.get('/getAllPermission',roleCheck(['owner','operator']), ownerController.getAllPermission);
router.get('/vehicles',roleCheck(['owner','operator','driver']),hasPermission('read', 'vehicle'), ownerController.getAllVehicles);
router.post('/createOwner',roleCheck(['superadmin']), ownerController.createOwner);
router.put('/update/:userId',roleCheck(['owner','operator']),hasPermission('edit', 'user'), updateUser);

router.get('/drivers',roleCheck(['owner','operator']), ownerController.findDrivers);
router.get('/plans',roleCheck(['owner','operator']),hasPermission('read', 'plan'), ownerController.getPlans);
router.get('/getDrivers',roleCheck(['owner','operator']),hasPermission('read', 'plan'), ownerController.getDrivers);
router.get('/drivers/:driverId/location',roleCheck(['owner','operator']),hasPermission('read', 'plan'), ownerController.driversloc);
router.get('/getProfile',roleCheck(['owner','operator','driver','superadmin']),ownerController.getProfile);
router.get('/vehicle/:id',roleCheck(['owner','operator','driver']),ownerController.viewVehicle );

// Route for editing vehicle details by vehicle ID
router.put('/vehicle/:id',roleCheck(['owner','operator','driver']), ownerController.editVehicle);
router.put("/updateStatus/:userId", toggleUserStatus);

module.exports = router;
