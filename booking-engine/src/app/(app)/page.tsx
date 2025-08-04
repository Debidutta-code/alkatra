"use client"
import 'regenerator-runtime/runtime';

import HotelCard from "@/components/hotelBox/HotelCard";
import DestinationCarousel from '@/components/homeComponents/HomeSection';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
   const router = useRouter();

    useEffect(() => {
    // Push dummy state to stack so user can’t go back
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Trap back/forward button and stay on home
      router.replace('/');
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div>
      {/* <BookingBox/> */}
      <HotelCard />
      <DestinationCarousel />
      {/* <PayNowFunction /> */}
    </div>
  );
}
