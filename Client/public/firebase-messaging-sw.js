// Import the Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyCbTkw0jO60O8w2K7zjASX_2VFzQDgeQJA",
    authDomain: "notification-project-a34db.firebaseapp.com",
    projectId: "notification-project-a34db",
    storageBucket: "notification-project-a34db.firebasestorage.app",
    messagingSenderId: "193562180319",
    appId: "1:193562180319:web:1a368ba72123e8cb77c76a",
    measurementId: "G-6TXGHC54NH"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

});
  