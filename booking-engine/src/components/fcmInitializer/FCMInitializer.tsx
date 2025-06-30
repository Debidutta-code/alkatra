// src/components/FCMInitializer.tsx
'use client';

import { useEffect } from 'react';
// import { useSelector } from 'react-redux';
import useFCM from '@/hooks/useFCM';
import { useSelector } from '@/Redux/store';



const FCMInitializer = () => {
    const userId = useSelector((state) => state.auth.user?._id); // ✅ assumes auth.user is set
    console.log('🚀 FCMInitializer userId:', userId);
      useFCM(userId);
  return null;
};

export default FCMInitializer;
