const { Noti } = require('../models/Notification');
const { Token } = require('../models/Token');
const Notification = require('../tEst/NotificationService');

const sendFirebaseNotification = async(req,res)=>{
    try {
        const {title,body,deviceToken}= req.body;
        await Notification.sendNotification(deviceToken,title,body);
        res.status(200).json({
            message:"Notification Sent Successfully",success:true
        })
    } catch (error) {
        console.log('Internal Server Error',error);
    }
}

// app.post('/api/save-token', async (req, res) => {
//     const { token } = req.body;
//     if (token) {
//       try {
//           const tokenFind = await Token.findOne({ token });
//           if (tokenFind) {
//               return res.status(400).json({
//                   message: "Token already exists",
//               });
//           }
          
//         const newToken = new Token({ token });
  
//         await newToken.save();
//         console.log('Token saved:', token);
//         res.status(200).send('Token saved');
//       } catch (error) {
//         if (error.code === 11000) {
//           // Duplicate key error
//           res.status(400).send('Token already exists');
//         } else {
//           console.error('Error saving token:', error);
//           res.status(500).send('Error saving token');
//         }
//       }
//     } else {
//       res.status(400).send('Invalid token');
//     }
//   });

const saveToken = async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Invalid token' });
    }
  
    try {
      const tokenFind = await Token.findOne({ token });
      if (tokenFind) {
        return res.status(400).json({ message: 'Token already exists' });
      }
      
      const newToken = new Token({ token });
      await newToken.save();
      console.log('Token saved:', token);
      res.status(200).json({ message: 'Token saved successfully' });
    } catch (error) {
      console.error('Error saving token:', error);
      res.status(500).json({ message: 'Error saving token' });
    }
  };

const getNotifications = async (req, res) => {
    console.log('req.user',req.user)
    const userId = req.user?.id; // Assume user ID is available in req.user
    try {
        const notifications = await Noti.find({ userId }).sort({ timestamp: -1 });
        res.json(notifications);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching notifications',error });
    }
};
module.exports = {sendFirebaseNotification, saveToken,getNotifications}