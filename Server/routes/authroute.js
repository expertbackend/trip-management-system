const express = require('express');
// const userController = require('../controller/userController');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login',login);
module.exports=router;