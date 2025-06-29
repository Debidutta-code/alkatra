// ✅ Import Firebase compat SDKs (not ESM!)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB0-X-D4ikdybTiYlEbLzSJ2OBEGSXKyFc",
  authDomain: "al-hajz.firebaseapp.com",
  projectId: "al-hajz",
  storageBucket: "al-hajz.firebasestorage.app",
  messagingSenderId: "237760329726",
  appId: "1:237760329726:web:17e26f92f9fcd0722f72af",
  measurementId: "G-8PBP168R92"
});

const messaging = firebase.messaging();
