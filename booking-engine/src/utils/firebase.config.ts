import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB0-X-D4ikdybTiYlEbLzSJ2OBEGSXKyFc",
  authDomain: "al-hajz.firebaseapp.com",
  projectId: "al-hajz",
  storageBucket: "al-hajz.firebasestorage.com",
  messagingSenderId: "237760329726",
  appId: "1:237760329726:web:17e26f92f9fcd0722f72af",
  measurementId: "G-8PBP168R92"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported: boolean) => {
    if (supported) {
      messaging = getMessaging(app);
    } else {
      console.warn("🚫 FCM is not supported in this browser.");
    }
  }).catch((err: any) => {
    console.error("❌ Error checking FCM support:", err);
  });
}

export { app, messaging };