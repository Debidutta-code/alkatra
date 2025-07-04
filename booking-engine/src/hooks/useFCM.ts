'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '../utils/firebase.config'; // ✅ Import the lazy function
import toast from 'react-hot-toast';

const vapidKey = process.env.NEXT_PUBLIC_VAPIDKEY as string;

const useFCM = (userId?: string) => {
  useEffect(() => {
    console.log('🔔 useFCM hook initialized with userId:', userId);

    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('🚫 Notification permission denied');
          return;
        }

        console.log('✅ Notification permission granted', vapidKey);

        const messaging = await getMessagingInstance(); // ✅ Safe, client-only

        if (!messaging) {
          console.error("Firebase Messaging is not supported in this browser.");
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        console.log('🔑 FCM Token:', token);

        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/register-device-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              token,
              platform: 'web',
            }),
          });
        }

        // ✅ Setup onMessage listener
        onMessage(messaging, (payload) => {
          console.log('📩 Foreground message:', payload.notification?.title);
          toast.success(`New Notification: ${payload.notification?.title}`, {
            duration: 5000,
            icon: '🔔',
          });
        });

      } catch (err) {
        console.error('❌ Error initializing FCM:', err);
      }
    };

    setupFCM();
  }, [userId]);
};

export default useFCM;
