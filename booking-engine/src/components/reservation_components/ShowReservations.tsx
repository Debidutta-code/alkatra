// import React, { useState } from 'react';
// import { GetReservationsOfUser } from "@/hooks/getReservations";
// import { useSelector } from "@/Redux/store";
// // import { deleteBooking } from '@/api/booking';
// import Cookies from 'js-cookie';

// export const ShowReservations = () => {
//   const accessToken = Cookies.get("accessToken");
//   const authUser: any = useSelector((state) => state.auth.user);
//   const { reservation } = GetReservationsOfUser(authUser?._id as string);

//   // State to track which property is clicked in mobile view
//   const [activeReservation, setActiveReservation] = useState<number | null>(null);

//   const toggleDetails = (index: number) => {
//     setActiveReservation(activeReservation === index ? null : index);
//   };

//   // const handleDeleteReservation = async (id: string) => {
//   //   const response = await deleteBooking(id, accessToken as string);
    
//   //   if (response) {
//   //     window.location.reload();
//   //   }
//   // };

//   return (
//     <>
//       {reservation?.length > 0 ? (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           {reservation.map((item: any, index: number) => (
//             <div
//               key={index}
//               className="p-4 border bg-white shadow-sm rounded-lg"
//               onClick={() => toggleDetails(index)}
//             >
//               {/* Property Name (Clickable on mobile) */}
//               <p className="font-semibold whitespace-nowrap truncate cursor-pointer lg:cursor-auto">
//                 {item?.property?.property_name}
//                 <span className="lg:hidden float-right">{activeReservation === index ? '-' : '+'}</span>
//               </p>

//               {/* Booking Details (Toggle visibility on mobile, always show on desktop) */}
//               <ul
//                 className={`mt-2 text-sm space-y-1 ${
//                   activeReservation === index || window.innerWidth >= 1024
//                     ? 'block'
//                     : 'hidden'
//                 } lg:block`}
//               >
//                 <li>
//                   <span className="font-semibold">Room Name:</span> {item?.room?.name}
//                 </li>
//                 <li>
//                   <span className="font-semibold">Room Price:</span> {item?.amount}
//                 </li>
//                 <li>
//                   <span className="font-semibold">Contact:</span> {item?.property?.property_contact}
//                 </li>
//                 <li>
//                   <span className="font-semibold">Email:</span> {item?.property?.property_email}
//                 </li>
//                 {/* <button onClick={() => handleDeleteReservation(item?._id as string)} className="p-2 bg-red-500 text-white rounded-lg text-sm mt-2 w-full">
//                   Cancel
//                 </button> */}
//               </ul>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-2xl p-7 m-3 text-center">No reservations found</p>
//       )}
//     </>
//   );
// };