"use client";

import React, { Suspense } from 'react';
import BookingComponent from '@/components/AppComponent/bookComponent';
import BackButton from '@/components/ui/buttons/BackButton';

const Page = () => {
  return (
    <>
      <Suspense>
      <div className='m-8'>
        <BackButton />
      </div>
      <BookingComponent />
      </Suspense>
    </>
  );
};

export default Page;
