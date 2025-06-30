'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../utils/firebase.config'; // Adjust the import path as needed

const vapidKey =  process.env.NEXT_PUBLIC_VAPIDKEY as string; // from Firebase Console

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
          
          console.log('✅ Notification permission granted',vapidKey);

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
    onMessage(messaging, (payload) => {
      console.log('📩 Foreground message:', payload);
      alert(payload.notification?.title);
    });
  }, [userId]);
};

export default useFCM;
