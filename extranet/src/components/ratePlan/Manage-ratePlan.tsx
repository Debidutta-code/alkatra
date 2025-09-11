// 'use client'
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Link from "next/link";
// import axios from "axios";
// import Breadcrumbs from "../../components/ui/breadcrumbs";
// import { Button } from "../../components/ui/button";
// import { Plus } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// import { getProperties } from "../../redux/slices/propertySlice";
// import { RootState, AppDispatch } from "../../redux/store";
// import { Props, RatePlan } from "../../types/property_type"
// import { EditRatePlan } from "./EditRatePlan";
// import toast from "react-hot-toast";
// import Image from "next/image";
// import { Label } from "../ui/label";

// const Rateplan: React.FC<Props> = ({ searchParams }) => {
//   const dispatch: AppDispatch = useDispatch();
//   const { draftProperties } = useSelector((state: RootState) => state.propertyReducer);
//   const { accessToken } = useSelector((state: RootState) => state.auth);
//   const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
//   const [properties, setProperties] = useState<any[]>([]);
//   const [selectedProperty, setSelectedProperty] = useState<any>({});
//   const [showEditModal, setShowEditModal] = useState<boolean>(false);
//   const [planID, setPlanID] = useState<string>('');

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       await dispatch(getProperties());
//   //       const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/price/getAll`, {
//   //         headers: {
//   //           Authorization: `Bearer ${accessToken}`,
//   //         },
//   //       });
//   //       if (Array.isArray(response?.data?.priceList)) {
//   //         setRatePlans(response?.data?.priceList);
//   //       } 
//   //       else {
//   //         console.error("Expected an array in response data:", response.data);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching data:", error);
//   //     }
//   //   };
//   //   fetchData();
//   // }, [dispatch, accessToken, ratePlans]);


//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/properties`, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         })

//         if (response.data.data !== null) {
//           console.log(response.data.data)
//           setProperties(response.data.data)
//           setSelectedProperty(response.data.data[0])
//           toast.success("Data fetched successfully");
//         }
//         else {
//           toast.error("Error fetching data");
//         }
//       } catch (error) {
//         console.log(error)
//         toast.error("Error fetching data");
//       }
//     };
//     fetchData();
//   }, [dispatch, accessToken, ratePlans]);


//   // useEffect(() => {}, [accessToken, properties]);


//   const handleDeleteRatePlan = async (id: string) => {
//     try {
//       const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/price/delete/${id}`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });

//       if (response.status === 200) {
//         setRatePlans(ratePlans.filter((plan) => plan._id !== id));
//         toast.success("Rate plan deleted successfully!");
//       }
//     } catch (error) {
//       console.error("Error deleting rate plan:", error);
//       toast.error("Failed to delete rate plan. Please try again later.");
//     }
//   }

//   const handleEdit = (id: string) => {
//     setShowEditModal(!showEditModal);
//     setPlanID(id)
//   }

//   console.log("Property: ", properties)
//   console.log("selectedProperty: ", selectedProperty)

//   return (
//     <main className="relative min-h-screen z-0 p-4 md:px-10 md:py-8 xl:py-8 xl:px-56 overflow-x-hidden">
//       <div className="flex items-center justify-between">
//         <Breadcrumbs />
//         <Link href="/app/rate-plan/create">
//           <Button variant="outline">
//             <Plus size={16} strokeWidth={2.5} className="mr-2" />
//             Create Rate Plan
//           </Button>
//         </Link>
//       </div>
//       <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 z-0">
//         {/* {ratePlans.map((plan) => (
//           <Card key={plan._id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="p-4">
//               <CardTitle className="text-lg font-semibold">{plan.price_category}</CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 pt-0 text-sm font-semibold dark:text-gray-300 ">
//               {plan.customTitle && (
//                 <p className="dark:text-gray-600">Custom Title: {plan.customTitle}</p>
//               )}
//               <p className="">Adult: ${plan.adultPrice}</p>
//               <p className="">Children: ${plan.childrenPrice}</p>
//               <p className="">Breakfast: ${plan.breakfastPrice}</p>
//               <p className="">Lunch: ${plan.lunchPrice}</p>
//               <p className="">Dinner: ${plan.dinnerPrice}</p>
//               <p className="">Room base price: ${plan.room_base_price}</p>
//               <p className="">CP: ${plan.CP}</p>
//               <p className="">MAP: ${plan.MAP}</p>
//               <p className="">AP: ${plan.AP}</p>
//               <p className="">EP: ${plan.EP}</p>
//               <div className="mt-4 flex gap-2 items-center">
//                 <Button onClick={() => handleEdit(plan._id)} className="w-full text-sm py-1" variant="outline">
//                   Edit
//                 </Button>
//                 <Button onClick={() => handleDeleteRatePlan(plan._id)} className="" variant="destructive">Delete</Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}  */}

//         <div>
//           {
//             properties?.length > 0 ?
//               <div>
//                 <div className="flex gap-5 items-center">
//                   <Label className="text-lg">Property</Label>
//                   <select className="p-2 rounded-md"
//                     name="property" id="property"
//                     onChange={(e: any) => setSelectedProperty(e.target.value)}
//                   >
//                     {
//                       properties?.map((property: any) => (
//                         <option key={property._id} value={property._id}>
//                           {property.property_name}
//                         </option>
//                       ))
//                     }
//                   </select>
//                 </div>

//                 <div>

//                 </div>
//               </div>
//               :
//               <>
//                 <p>No properties found</p>
//               </>
//           }
//         </div>
//       </div>

//       {showEditModal &&
//         <div className="absolute top-0 left-0 z-10 w-full h-full  bg-[#000000b1]">
//           <div className="py-24 h-full backdrop-blur-md">
//             <EditRatePlan
//               plan={ratePlans.filter((plan: RatePlan) => plan._id === planID)[0]}
//               setShowEditModal={setShowEditModal}
//               setRatePlans={setRatePlans}
//             />
//           </div>
//         </div>
//       }
//     </main>
//   );
// };

// export default Rateplan;