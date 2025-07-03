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

// Handle background messages
// messaging.onBackgroundMessage((payload) => {
//   console.log('📩 Background Message received:', payload);
  
//   const notificationTitle = payload.notification?.title || 'New Notification';
//   const notificationOptions = {
//     body: payload.notification?.body || '',
//     icon: '/favicon.ico',
//     badge: '/favicon.ico',
//     tag: payload.data?.tag || 'default',
//     data: payload.data,
//     requireInteraction: true,
//     actions: [
//       {
//         action: 'view',
//         title: 'View'
//       },
//       {
//         action: 'dismiss',
//         title: 'Dismiss'
//       }
//     ]
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// // Handle notification click
// self.addEventListener('notificationclick', (event) => {
//   console.log('🔔 Notification clicked:', event);
//   event.notification.close();
  
//   if (event.action === 'view') {
//     // Handle view action
//     event.waitUntil(
//       clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
//         // If a window/tab is already open, focus it
//         for (const client of clientList) {
//           if (client.url === self.location.origin && 'focus' in client) {
//             return client.focus();
//           }
//         }
//         // Otherwise, open a new window/tab
//         if (clients.openWindow) {
//           return clients.openWindow('/');
//         }
//       })
//     );
//   } else if (event.action === 'dismiss') {
//     // Handle dismiss action
//     console.log('Notification dismissed');
//   } else {
//     // Default action (clicking on the notification body)
//     event.waitUntil(
//       clients.openWindow('/')
//     );
//   }
// });

// // Handle service worker installation
// self.addEventListener('install', (event) => {
//   console.log('🔧 Service worker installing...');
//   self.skipWaiting();
// });

// // Handle service worker activation
// self.addEventListener('activate', (event) => {
//   console.log('✅ Service worker activated');
//   event.waitUntil(clients.claim());
// });