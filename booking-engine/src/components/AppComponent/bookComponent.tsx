
"use client";

import 'regenerator-runtime/runtime';

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
// import { roomsById } from '@/api/hotel';
import { Triangle } from 'react-loader-spinner';
import CheckAuthentication from '@/components/check_authentication/CheckAuth';
import {UserForm} from '@/components/Forms/UserForm';
// import { roomsById } from '@/api/hotel';

const BookingComponent = () => {
  const [room, setRoom] = useState<any>([]);
  const params = useSearchParams();
  const roomId = params.get("roomId");

  // useEffect(() => {
  //   if (roomId) {
  //     roomsById(roomId)
  //       .then(async (response: any) => {
  //         if (response) {
  //           setRoom(response.data);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   }
  // }, [roomId]); // Added roomId as a dependency

  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <CheckAuthentication setLoading={setLoading}>
        <div className="h-[100svh] w-[100svw] flex justify-center items-center">
          <Triangle
            visible={true}
            height="100"
            width="100"
            color="#282D4D"
            ariaLabel="triangle-loading"
          />
        </div>
      </CheckAuthentication>
    );
  }

  return (
    <>
      <CheckAuthentication setLoading={setLoading}>
        <UserForm roomData={room} />
      </CheckAuthentication>
    </>
  );
};

export default BookingComponent;
