import 'regenerator-runtime/runtime';

import HotelCard from "@/components/HotelBox/HotelCard";
import DestinationCarousel from '@/components/homeComponents/HomeSection';

export default function Home() {
  return (
    <div>
      {/* <BookingBox/> */}
      <HotelCard />
      <DestinationCarousel />
      {/* <PayNowFunction /> */}
    </div>
  );
}
