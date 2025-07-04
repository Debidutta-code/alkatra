'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../utils/firebase.config'; // Adjust the import path as needed
import toast from 'react-hot-toast';

const vapidKey = process.env.NEXT_PUBLIC_VAPIDKEY as string; // from Firebase Console

const useFCM = (userId?: string) => {
  useEffect(() => {

    console.log('🔔 useFCM hook initialized with userId-----------------------------:', userId);
    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('🚫 Notification permission denied');
          return;
        }

        console.log('✅ Notification permission granted', vapidKey);

        if (!messaging) {
          console.error("Firebase Messaging is not supported in this browser.");
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        console.log('🔑 FCM Token:', token);

        if (token) {
          console.log('📱 FCM Token:', token);

          // 🔁 Send to backend
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/register-device-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Include auth token if needed
            },
            body: JSON.stringify({
              userId,
              token,
              platform: 'web',
            }),
          });
        }
      } catch (err) {
        console.error('❌ Error getting FCM token:', err);
      }
    };

    setupFCM();
    console.log('✅ useFCM effect running, setting up onMessage...');


    // Optional: Handle incoming messages
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('📩 Foreground message:', payload);
        toast.success(`New Notification Received: ${payload.notification?.title}`, {
            duration: 5000,
            icon: '🔔',
        //   position: 'top-right',
        });
      });
    } else {
      console.warn('❌ Firebase Messaging is not available (unsupported browser or not initialized)');
    }
  }, [userId]);
};

export default useFCM;