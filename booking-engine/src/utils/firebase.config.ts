// utils/firebase-config.ts
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB0-X-D4ikdybTiYlEbLzSJ2OBEGSXKyFc",
  authDomain: "al-hajz.firebaseapp.com",
  projectId: "al-hajz",
  storageBucket: "al-hajz.firebasestorage.com",
  messagingSenderId: "237760329726",
  appId: "1:237760329726:web:17e26f92f9fcd0722f72af",
  measurementId: "G-8PBP168R92"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };


