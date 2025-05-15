// "use client";

// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "./../ui/card";
// import { Label } from "./../ui/label";
// import { Input } from "./../ui/input";
// import { Button } from "./../ui/button";
// import { z } from "zod";
// import { useForm, SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import toast from "react-hot-toast";
// import { useSearchParams } from "next/navigation";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";

// // Define validation schema for rate plan inputs
// const ratePlanSchema = z.object({
//   applicable_room_type: z.string(),
//   meal_plan: z.enum([
//     "Including breakfast",
//     "Including breakfast, lunch and dinner",
//     "Including breakfast, lunch or dinner",
//     "Room Only",
//   ]),
//   room_price: z.number().nonnegative("Room price must be a positive number"),
//   rate_plan_name: z.string().min(1, "Rate plan name is required"),
//   rate_plan_description: z.string().min(1, "Rate plan description is required"),
//   min_length_stay: z.number().nonnegative("Minimum length stay must be a positive number"),
//   max_length_stay: z.number().nonnegative("Maximum length stay must be a positive number").optional().default(0),
//   min_book_advance: z.number().nonnegative("Minimum book advance must be a positive number"),
//   max_book_advance: z.number().nonnegative("Maximum book advance must be a positive number").optional().default(0),
// });

// type RatePlanInputs = z.infer<typeof ratePlanSchema>;

// // const initialRatePlanOptions = [
// //   { price_category: "Premium", label: "Premium Rate Plan" },
// //   { price_category: "Offer", label: "Offer Rate Plan" },
// //   { price_category: "Holiday", label: "Holiday Combo Rate Plan" },
// //   { price_category: "Custom", label: "Custom Rate Plan" },
// // ];

// const RatePlanForm = () => {
//   const { accessToken } = useSelector((state: RootState) => state.auth);
//   const property_id: string = useSearchParams().get("property_id") ?? "";
//   console.log(property_id);

//   const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RatePlanInputs>({
//     resolver: zodResolver(ratePlanSchema),
//   });

//   const [ratePlans, setRatePlans] = useState<RatePlanInputs[]>([]);
//   const [rooms, setRooms] = useState<any[]>([]);
//   const [showForm, setShowForm] = useState(true);
//   // const [availableRatePlans, setAvailableRatePlans] = useState(initialRatePlanOptions);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);

//   const onSubmit: SubmitHandler<RatePlanInputs> = async (data) => {
//     try {
//       let payload, response;

//       if (data.customTitle !== undefined) {
//         payload = { ...data, price_category: data.customTitle, property_id };
//       } else {
//         payload = { ...data, property_id };
//       }

//       if (editingIndex !== null) {
//         // Update existing plan
//         response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URI}/price/update/${ratePlans[editingIndex]}`, payload, {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });
//         const updatedPlans = [...ratePlans];
//         updatedPlans[editingIndex] = data;
//         setRatePlans(updatedPlans);
//         toast.success("Rate plan updated successfully!");
//       } else {
//         // Create new plan
//         response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/price/create`, payload, {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });
//         // console.log("response.data", response.data);
//         setRatePlans([...ratePlans, response.data.priceList]);
//         if (data.price_category !== "Custom") {
//           setAvailableRatePlans(availableRatePlans.filter(option => option.price_category !== data.price_category));
//         }
//         toast.success("Rate plan added successfully!");
//       }

//       // console.log(response.data);
//       reset();
//       setShowForm(false);
//       setEditingIndex(null);
//     } catch (error) {
//       console.error("Error submitting rate plan:", error);
//       toast.error(editingIndex !== null ? "Failed to update rate plan" : "Failed to add rate plan");
//     }
//   };

//   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedValue = e.target.value;
//     // setValue("price_category", selectedValue);
//   };

//   // const showCustomTitle = watch("price_category") === "Custom";

//   const handleCreateAnother = () => {
//     setShowForm(true);
//     setEditingIndex(null);
//   };

//   const handleEdit = (index: number) => {
//     setEditingIndex(index);
//     const planToEdit = ratePlans[index];
//     reset(planToEdit);
//     setShowForm(true);
//   };

//   async function getRoomsByPropertyId() {
//     try {
//       const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/pms/room/${property_id}`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         }
//       },
//       )
//       console.log(response.data?.data)
//       setRooms(response.data?.data)
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   useEffect(() => {
//     getRoomsByPropertyId()
//   }, [])

//   return (
//     <div className="space-y-4 mt-6  p-4 ">
//       <CardTitle>Rate Plan</CardTitle>

//       {showForm ? (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div className="flex flex-col items-center justify-center gap-4">
//             <div className="w-full ">
//               <Label htmlFor="title" >Applicable room type</Label>
//               <select
//                 className="block w-full mt-5 px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm focus:outline-white h-12"
//                 {...register("applicable_room_type")}
//                 onChange={handleSelectChange}
//               >
//                 <option value="">Select a rate plan</option>
//                 {rooms.map((room) => (
//                   <option key={room.room_name} value={room.room_name}>
//                     {room.room_name}
//                   </option>
//                 ))}
//               </select>
//               </div>
//               {/* {errors.room_name && (
//                 <p className="text-red-500 text-sm">{errors.room_name.message}</p>
//               )} */}


//               {/* Meal Plan Field */}
//               <div className="w-full">
//                 <Label htmlFor="meal_plan">Meal Plan</Label>
//                 <select
//                   id="meal_plan"
//                   {...register("meal_plan")}
//                   className="block w-full mt-5 px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 >
//                   <option value="">Select a meal plan</option>
//                   <option value="Including breakfast">Including breakfast</option>
//                   <option value="Including breakfast, lunch and dinner">Including breakfast, lunch and dinner</option>
//                   <option value="Including breakfast, lunch or dinner">Including breakfast, lunch or dinner</option>
//                   <option value="Room Only">Room Only</option>
//                 </select>
//                 {errors.meal_plan && (
//                   <p className="text-red-500 text-sm">{errors.meal_plan.message}</p>
//                 )}
//               </div>


            
//           </div>

//           {/* {showCustomTitle && (
//             <div className="flex items-center justify-center gap-4">
//               <div className="w-full">
//                 <Label htmlFor="customTitle">Custom Title</Label>
//                 <Input
//                   id="customTitle"
//                   type="text"
//                   {...register("customTitle")}
//                   className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 />
//                 {errors.customTitle && (
//                   <p className="text-red-500 text-sm">
//                     {errors.customTitle.message}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )} */}

//           {/* <div className="flex items-center justify-center gap-4">
//             <div className="w-full">
//               <Label htmlFor="adultPrice">Adult Price</Label>
//               <Input
//                 id="adultPrice"
//                 type="number"
//                 {...register("adultPrice", { valueAsNumber: true })}
//                 className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//               {errors.adultPrice && (
//                 <p className="text-red-500 text-sm">
//                   {errors.adultPrice.message}
//                 </p>
//               )}
//             </div>
//             <div className="w-full">
//               <Label htmlFor="childrenPrice">Children Price</Label>
//               <Input
//                 id="childrenPrice"
//                 type="number"
//                 {...register("childrenPrice", { valueAsNumber: true })}
//                 className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//               {errors.childrenPrice && (
//                 <p className="text-red-500 text-sm">
//                   {errors.childrenPrice.message}
//                 </p>
//               )}
//             </div>
//             <div className="w-full">
//               <Label htmlFor="room_base_price">Room Base Price</Label>
//               <Input
//                 id="room_base_price"
//                 type="number"
//                 {...register("room_base_price", { valueAsNumber: true })}
//                 className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//               {errors.room_base_price && (
//                 <p className="text-red-500 text-sm">
//                   {errors.room_base_price.message}
//                 </p>
//               )}
//             </div>
//           </div> */}

//           {/* <div className="flex items-center justify-center gap-4">
//             <div className="w-full">
//               <Label htmlFor="breakfast">Breakfast Price</Label>
//               <Input
//                 id="breakfastPrice"
//                 type="number"
//                 {...register("breakfastPrice", { valueAsNumber: true })}
//                 className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//               {errors.breakfastPrice && (
//                 <p className="text-red-500 text-sm">
//                   {errors.breakfastPrice.message}
//                 </p>
//               )}
//             </div>
//             <div className="w-full">
//               <Label htmlFor="lunch">Lunch Price</Label>
//               <Input
//                 id="lunchPrice"
//                 type="number"
//                 {...register("lunchPrice", { valueAsNumber: true })}
//                 className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//               {errors.lunchPrice && (
//                 <p className="text-red-500 text-sm">{errors.lunchPrice.message}</p>
//               )}
//             </div>
//             <div className="w-full">
//               <Label htmlFor="dinner">Dinner Price</Label>
//               <Input
//                 id="dinnerPrice"
//                 type="number"
//                 {...register("dinnerPrice", { valueAsNumber: true })}
//                 className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//               {errors.dinnerPrice && (
//                 <p className="text-red-500 text-sm">{errors.dinnerPrice.message}</p>
//               )}
//             </div>
//           </div> */}
//           <div className="flex justify-end space-x-2">
//             <Button type="submit">
//               {editingIndex !== null ? "Update Rate Plan" : "Submit"}
//             </Button>
//           </div>
//         </form>
//       ) : (
//         <div className="flex justify-end">
//           <Button onClick={handleCreateAnother}>Create Another Rate Plan</Button>
//         </div>
//       )}

//       {ratePlans.length > 0 && (
//         <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {ratePlans.map((plan, index) => (
//             <Card key={index} className="mt-4 px-2 shadow-sm hover:shadow-md transition-shadow duration-200">
//               <CardHeader className="p-4">
//                 {/* <CardTitle className="text-lg font-semibold">{plan.price_category}</CardTitle> */}
//               </CardHeader>
//               <CardContent className="p-4 pt-0 space-y-1 text-sm">
//                 {/* {plan.customTitle && (
//                   <p className="text-white-600">Custom Title: {plan.customTitle}</p>
//                 )}
//                 <p className="text-white-600">Adult: ${plan.adultPrice}</p>
//                 <p className="text-white-600">Children: ${plan.childrenPrice}</p>
//                 <p className="text-white-600">Breakfast: ${plan.breakfastPrice}</p>
//                 <p className="text-white-600">Lunch: ${plan.lunchPrice}</p>
//                 <p className="text-white-600">Dinner: ${plan.dinnerPrice}</p>
//                 <p className="text-white-600">Room Base Price: ${plan.room_base_price}</p>
//                 <p className="text-white-600">CP: ${plan.CP}</p>
//                 <p className="text-white-600">MAP: ${plan.MAP}</p>
//                 <p className="text-white-600">AP: ${plan.AP}</p>
//                 <p className="text-white-600">EP: ${plan.EP}</p> */}
//                 <Button
//                   onClick={() => handleEdit(index)}
//                   className="mt-4 w-full text-sm py-1"
//                   variant="outline"
//                 >
//                   Edit
//                 </Button>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RatePlanForm;