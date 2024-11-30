const express = require('express');
const router = express.Router();
const tyreController = require('../controllers/TyreController');
const authMiddleware = require('../middlewares/authMiddleware');
router.use(authMiddleware);
// Register a new tyre
router.post('/register', tyreController.registerTyre);
router.get('/reminders', tyreController.getReminders);
router.get('/reminders/:id', tyreController.getReminderById);
// Check tyre status
router.get('/check/:vehicleId/:tyrePosition', tyreController.checkTyreStatus);
router.get('/', tyreController.getAllTyres);
router.post("/vehicle", tyreController.createVehicleDocument);
router.put("/vehicle-documents/:documentId", tyreController.updateVehicleDocument);

router.get("/vehicles", tyreController.getVehicleDocuments);
router.post("/vehicle-document", tyreController.createVehicleService);
router.get("/vehicle-document", tyreController.getAllVehicleServices);
router.get('/calculate-profit', tyreController.calculateProfit);

module.exports = router;
