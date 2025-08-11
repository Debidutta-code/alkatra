
import React, { Suspense } from 'react';
import HotelList from '../../../components/appComponent/HotelListing';

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
