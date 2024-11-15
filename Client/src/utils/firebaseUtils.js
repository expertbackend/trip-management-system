import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCbTkw0jO60O8w2K7zjASX_2VFzQDgeQJA",
    authDomain: "notification-project-a34db.firebaseapp.com",
    projectId: "notification-project-a34db",
    storageBucket: "notification-project-a34db.firebasestorage.app",
    messagingSenderId: "193562180319",
    appId: "1:193562180319:web:1a368ba72123e8cb77c76a",
    measurementId: "G-6TXGHC54NH"
  };

  const vapidKey = 'BPSmr0WHk4FfGkak9acGDuS5BQczDeHfqRmim_QgJ6vbPqjSFnMFJuKdLjnW9ZQBh1wjWZeQoc-JjTF2KP39m-o';
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  export const requestFCMToken = async () => {
    return  Notification.requestPermission().then((permission)=>{
        if(permission =='granted'){
            return getToken(messaging,{vapidKey});
        }
        else{
throw new Error("Notification Not Granted")
        }
    }).catch((err)=>{
        console.log("Error getting FCM Token",err)
    })
  }