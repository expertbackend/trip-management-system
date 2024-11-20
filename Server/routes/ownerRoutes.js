const express = require('express');
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleCheck = require('../middlewares/roleMiddleware');
const { hasPermission } = require('../middlewares/permissions');
const { createUser, getAllUsers } = require('../controllers/authController');

const router = express.Router();

// Middleware for owner authentication
router.use(authMiddleware); // Apply this to all owner routes

router.post('/buy-plan',roleCheck(['owner']), ownerController.buyPlan);
router.post('/add-vehicle',roleCheck(['owner','operator']),hasPermission('create', 'vehicle'), ownerController.addVehicle);
// router.post('/create-user',roleCheck(['owner','operator']),hasPermission('create', 'user'), ownerController.createUser);
router.post('/assign-vehicle',roleCheck(['owner','operator']),hasPermission('create', 'vehicle'), ownerController.assignVehicleToDriver);
router.post('/assign-permissions',roleCheck(['owner']), ownerController.assignPermissions);
router.post('/createUser',roleCheck(['owner']), createUser);
router.get('/users',roleCheck(['owner']), getAllUsers);
router.get('/getAllPermission',roleCheck(['owner']), ownerController.getAllPermission);
router.get('/vehicles',roleCheck(['owner','operator']), ownerController.getAllVehicles);
router.get('/drivers',roleCheck(['owner','operator']), ownerController.findDrivers);
router.get('/plans',roleCheck(['owner','operator']),hasPermission('read', 'plan'), ownerController.getPlans);
router.get('/getDrivers',roleCheck(['owner','operator']),hasPermission('read', 'plan'), ownerController.getDrivers);
router.get('/drivers/:driverId/location',roleCheck(['owner','operator']),hasPermission('read', 'plan'), ownerController.driversloc);
router.get('/getProfile',roleCheck(['owner','operator','driver']),ownerController.getProfile);


module.exports = router;
