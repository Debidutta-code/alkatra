// "use client";

// import 'regenerator-runtime/runtime';

// import React, { useState } from "react";
// import HotelDetailsCard from "../HotelBox/HotelDetailsCard";
// import { useDispatch } from "react-redux";
// import { useRouter } from "next/navigation";
// import { useSelector } from "@/Redux/store";
// import { RootState } from "@/Redux/store";



// export const UserForm = ({ roomData }: any) => {
//   console.log("Booking page: ", roomData);

//   const router = useRouter()

//   const dispatch = useDispatch();
//   const authUser = useSelector((state: RootState) => state.auth.user);

//   console.log("all usert value", authUser)

//   const [formData, setFormData] = useState({
//     firstName: authUser?.firstName,
//     lastName: authUser?.lastName,
//     email: authUser?.email,
//     countryCode: "",
//     phoneNumber: "",
//     country: "United States",
//   });


//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//   };


//   const handleSubmit = () => {

//     localStorage.setItem("formData", JSON.stringify(formData))
//     dispatch({ type: "SUBMIT_FORM", payload: formData });
//     // router.push(`${pathname}?formData=${JSON.stringify(formData)}`)
//     console.log(formData, "form data");
//   };



//   return (
//     // <div className="grid grid-cols-2 gap-4 m-10 lg:w-1/2 border-2 border-red-500">
//     <div className=" px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 justify-center" >
//       {/* p-4 m-4 
//       p-8 m-4*/}
//       {/* <div className="col-span-1 border"> */}
//       {/* <div className="space-y-12 p-10"> */}
//       {/* <div className=" pb-12 border border-green-400"> */}
//       <div className='col-span-1 mb-4 '>
//         <HotelDetailsCard data={roomData} formData={formData} />
//       </div>
//       <div className="px-6 sm:py-3 lg:py-28  md:py-24" >
//         {/* lg:h-unit-lg */}

//         <h2 className="text-base font-semibold leading-7 text-gray-900">
//           Personal Information
//         </h2>
//         <p className="mt-1 text-sm leading-6 text-gray-600">
//           Use a permanent address where you can receive mail.
//         </p>

//         <div className="mt-8 gap-x-6 gap-y-8 sm:grid-cols-6">
//           <div className="sm:col-span-3">
//             <label className="block text-sm font-medium leading-6 text-gray-900">
//               First name
//             </label>
//             <div className="mt-2">
//               <input
//                 type="text"
//                 name="firstName"
//                 id="first-name"
//                 value={formData.firstName}
//                 onChange={handleInputChange}
//                 className="block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset sm:text-sm sm:leading-6"
//               />
//             </div>
//           </div>

//           <div className="sm:col-span-3">
//             <label className="block text-sm font-medium leading-6 text-gray-900 mt-4">
//               Last name
//             </label>
//             <div className="mt-2">
//               <input
//                 type="text"
//                 name="lastName"
//                 id="last-name"
//                 value={formData.lastName}
//                 onChange={handleInputChange}
//                 className="block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  sm:text-sm sm:leading-6"
//               />
//             </div>
//           </div>
//           <div className="sm:col-span-3">
//             <label className="block text-sm font-medium leading-6 text-gray-900 mt-4">
//               Email address
//             </label>
//             <div className="mt-2">
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className="block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//               />
//             </div>
//           </div>
//           <div className="sm:col-span-3">
//             <label className="block text-sm  mt-4 font-medium leading-6 text-gray-900">
//               Phone no. & Country Code
//             </label>
//             <div className="mt-2 flex">
//               <input
//                 id="countryCode"
//                 name="countryCode"
//                 type="tel"
//                 placeholder="91"
//                 className="block p-1 mt-2 mb-2 mr-2 w-1/4 sm:w-1/6 md:w-1/5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//               />
//               {/* Spacer */}
//               {/* Phone Number Input */}
//               <input
//                 id="phoneNumber"
//                 name="phoneNumber"
//                 type="tel"
//                 placeholder="123-456-7890"
//                 value={formData.phoneNumber}
//                 onChange={handleInputChange}
//                 className="block p-3 m-2 w-full sm:w-2/3 md:w-3/4 lg:w-4/5 rounded-md border-0  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//               />
//             </div>
//           </div>

//           <div className="sm:col-span-3">
//             <label className="block text-sm mt-4 font-medium leading-6 text-gray-900">
//               Country
//             </label>
//             <div className="mt-2">
//               <select
//                 id="country"
//                 name="country"
//                 value={formData.country}
//                 onChange={handleInputChange}
//                 className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
//               >
//                 <option>United States</option>
//                 <option>Canada</option>
//                 <option>Mexico</option>
//               </select>
//             </div>
//           </div>
//         </div>
//         {/* </div> */}
//         {/* <div className="mt-4 flex items-center justify-end gap-x-6"> */}
//         <div className="mt-4 flex items-center  gap-6">
//           <button
//             type="button"
//             className="text-sm font-semibold leading-6 text-gray-900"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled
//             className="...cursor-not-allowed"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//       {/* </div> */}

//     </div>
//   );
// };
