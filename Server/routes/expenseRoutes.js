const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addExpense } = require('../controllers/expenseController');
const { hasPermission } = require('../middlewares/permissions');
const roleCheck = require('../middlewares/roleMiddleware');
router.use(authMiddleware);
router.post('/expanse',roleCheck(['owner','operator','driver']),hasPermission('create', 'expense'),addExpense)