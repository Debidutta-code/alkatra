// "use client"
// import { CardTitle } from '../ui/card'
// import { Input } from '../ui/input'
// import { Label } from '../ui/label'
// import { useForm, SubmitHandler } from "react-hook-form";
// import { RatePlan, EditedRatePlan } from "../../types/property_type"
// import { Button } from '../ui/button';
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";
// import toast from 'react-hot-toast';

// type Props = {
//   plan: RatePlan,
//   setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
//   setRatePlans: React.Dispatch<React.SetStateAction<RatePlan[]>>;
// }

// export const EditRatePlan = ({ plan, setShowEditModal, setRatePlans }: Props) => {
//   const { accessToken } = useSelector((state: RootState) => state.auth);
//   const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
//     defaultValues: {
//       price_category: plan?.price_category,
//       adultPrice: plan?.adultPrice,
//       childrenPrice: plan?.childrenPrice,
//       room_base_price: plan?.room_base_price,
//       breakfastPrice: plan?.breakfastPrice,
//       lunchPrice: plan?.lunchPrice,
//       dinnerPrice: plan?.dinnerPrice
//     }
//   });

//   const onSubmit: SubmitHandler<EditedRatePlan> = async (data) => {
//     try {
//       if (!accessToken) return toast.error("Unauthorized Access");
//       const editedRatePlanResponse = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/price/update-price/${plan._id}`, 
//         data, {
//         headers: { 
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       if (editedRatePlanResponse.status === 200) {
//         toast.success("Rate plan updated successfully");
//         setRatePlans(prevRatePlans => [...prevRatePlans, editedRatePlanResponse.data.newList]);
//       }
//     } catch (error) {
//       toast.error("Unable to update rate plan, please try again");
//     } finally {
//       reset();
//       setShowEditModal(false);
//     }
//   }

//   return (
//     <div className='py-8 px-56 space-y-6'>
//       <CardTitle>Edit Rate Plan</CardTitle>
//       <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
//         <div className="flex flex-col gap-2">
//           <Label htmlFor="price_category" className='text-lg'>Category</Label>
//           <Input
//             id="price_category"
//             type="text"
//             {...register("price_category")}
//             className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>
//         <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-4'>
//           <div className="flex flex-col gap-2">
//             <Label htmlFor="adultPrice" className='text-lg'>Adult Price</Label>
//             <Input
//               id="adultPrice"
//               type="text"
//               {...register("adultPrice")}
//               className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div className="flex flex-col gap-2">
//             <Label htmlFor="childrenPrice" className='text-lg'>Children Price</Label>
//             <Input
//               id="childrenPrice"
//               type="text"
//               {...register("childrenPrice")}
//               className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div className="flex flex-col gap-2">
//             <Label htmlFor="room_base_price" className='text-lg'>Room Base Price</Label>
//             <Input
//               id="room_base_price"
//               type="text"
//               {...register("room_base_price")}
//               className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div className="flex flex-col gap-2">
//             <Label htmlFor="breakfastPrice" className='text-lg'>Breakfast Price</Label>
//             <Input
//               id="breakfastPrice"
//               type="text"
//               {...register("breakfastPrice")}
//               className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div className="flex flex-col gap-2">
//             <Label htmlFor="lunchPrice" className='text-lg'>Lunch Price</Label>
//             <Input
//               id="lunchPrice"
//               type="text"
//               {...register("lunchPrice")}
//               className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div className="flex flex-col gap-2">
//             <Label htmlFor="dinnerPrice" className='text-lg'>Dinner Price</Label>
//             <Input
//               id="dinnerPrice"
//               type="text"
//               {...register("dinnerPrice")}
//               className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//         </div>

//         {/* Cancel or Submit Edited Rate Plan */}
//         <div className="flex justify-end gap-4">
//           <Button onClick={() => setShowEditModal(false)} variant={"outline"}>Cancel</Button>
//           <Button type='submit'>Submit</Button>
//         </div>
//       </form>
//     </div>
//   )
// }