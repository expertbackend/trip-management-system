const express = require('express');
const router = express.Router();
const {sendFirebaseNotification, saveToken, getNotifications} = require('../controllers/firebaseControllers');
const authMiddleware = require('../middlewares/authMiddleware');
router.use(authMiddleware);
router.post('/send-notification',async(req,res)=>{
    const result = await sendFirebaseNotification(req,res);
    return res.json(result)
})
router.post('/save-token', saveToken);
router.get('/getAllNotification',getNotifications)
module.exports = router