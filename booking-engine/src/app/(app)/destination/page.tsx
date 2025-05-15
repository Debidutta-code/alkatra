
import React, { Suspense } from 'react';
import HotelList from '@/components/AppComponent/hotelListing';

const HotelSearchPage: React.FC = () => {
  return (
    <div>
  <Suspense>
    <HotelList />
  </Suspense>
    </div>
  );
};

export default HotelSearchPage;
