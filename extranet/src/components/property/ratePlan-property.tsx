"use client";
import React, { useState, useEffect } from "react";
import { CardContent, CardFooter, CardTitle, } from "./../ui/card";
import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Button } from "./../ui/button";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RootState, useSelector } from "../../redux/store";
import { useRouter, useSearchParams } from "next/navigation";
const createRatePlanSchema = z.object({
  applicable_room_type: z.string().min(1, "Applicable room type is required"),
  meal_plan: z.string().min(1, "Meal plan is required"),
  rate_plan_name: z.string().min(1, "Rate plan name is required"),
  rate_plan_description: z.string().min(1, "Rate plan description is required"),
  min_length_stay: z.number().int().min(0, "Minimum length stay is required and must be a positive number"),
  max_length_stay: z.number().int().min(0, "Maximum length stay is required and must be a positive number"),
  min_book_advance: z.number().int().min(0, "Minimum book advance is required and must be a positive number"),
  max_book_advance: z.number().int().min(0, "Maximum book advance is required and must be a positive number"),
  room_price: z.number().int().min(1, "Room price is required and must be greater than zero"),
});
type Inputs = {
  applicable_room_type: string,
  meal_plan: string,
  room_price: number,
  rate_plan_name: string,
  rate_plan_description?: string,
  min_length_stay: number,
  max_length_stay?: number,
  min_book_advance: number,
  max_book_advance?: number
};
type Props = { onPrevious: () => void };
export default function RatePlan({ onPrevious }: Props) {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [ratePlan, setRatePlan] = useState<Inputs | null>(null);
  const [category, setCategory] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const router = useRouter();
  const property_id: string = useSearchParams().get("property_id") ?? "";
  const form = useForm<Inputs>({
    defaultValues: {
      applicable_room_type: "",
      meal_plan: "",
      room_price: 0,
      rate_plan_name: "",
      rate_plan_description: "",
      min_length_stay: 0,
      max_length_stay: 0,
      min_book_advance: 0,
      max_book_advance: 0,
    },
    resolver: zodResolver(createRatePlanSchema),
  });
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, getValues } = form;
  const onSubmit = async (data: Inputs) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${property_id}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
      );
      if (response) {
        toast.success("Rate Plan created successfully!");
        setRatePlan(response.data.data);
        router.push("/app/property");
      }
    }
    catch (err) {
      toast.error("Failed to create rate plan");
    }
    finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (ratePlan) {
      setValue("applicable_room_type", ratePlan.applicable_room_type || "");
      setValue("meal_plan", ratePlan.meal_plan || "");
      setValue("room_price", ratePlan.room_price || 0);
      setValue("rate_plan_name", ratePlan.rate_plan_name || "");
      setValue("rate_plan_description", ratePlan.rate_plan_description || "");
      setValue("min_length_stay", ratePlan.min_length_stay || 0);
      setValue("max_length_stay", ratePlan.max_length_stay || 0);
      setValue("min_book_advance", ratePlan.min_book_advance || 0);
      setValue("max_book_advance", ratePlan.max_book_advance || 0);
    }
  }, [ratePlan, setValue]);

  async function getRoomsByPropertyId() {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/rooms_by_propertyId/${property_id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      },
      )
      console.log("ROOMS: ", response.data?.data)
      setRooms(response.data?.data)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getRoomsByPropertyId()
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CardTitle className="text-lg font-semibold">Rate Plan</CardTitle>
      <CardContent className="px-6 flex flex-col gap-4">
        {/* Applicable Room Type Field */}
        <div className="w-full">
          <Label htmlFor="applicable_room_type" className="text-sm font-medium">Applicable Room Type <span className="text-destructive">*</span></Label>
          <div className="relative w-full">
            <select
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
        focus:ring-indigo-500 focus:border-indigo-500 
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-200 
        sm:text-sm h-10 appearance-none pr-8"
              {...register("applicable_room_type", { required: "Applicable room type is required" })}
            >
              <option value="">Select a rate plan</option>
              {rooms?.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.room_name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z" />
              </svg>
            </div>
          </div>
          {errors.applicable_room_type && (
            <p className="text-red-500 text-sm">{errors.applicable_room_type.message}</p>
          )}
        </div>

        {/* Meal Plan Field */}
        <div className="w-full">
          <Label htmlFor="meal_plan" className="text-sm font-medium">Meal Plan <span className="text-destructive">*</span></Label>
          <div className="relative w-full">
            <select
              id="meal_plan"
              {...register("meal_plan")}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
        focus:ring-indigo-500 focus:border-indigo-500 
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-200 
        sm:text-sm h-10 appearance-none pr-8"
            >
              <option value="">Select a meal plan</option>
              <option value="Including breakfast">Including breakfast</option>
              <option value="Including breakfast, lunch and dinner">Including breakfast, lunch and dinner</option>
              <option value="Including breakfast, lunch or dinner">Including breakfast, lunch or dinner</option>
              <option value="Room Only">Room Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z" />
              </svg>
            </div>
          </div>
          {errors.meal_plan && (
            <p className="text-red-500 text-sm">{errors.meal_plan.message}</p>
          )}
        </div>

        {/* Rate plan name */}
        <div className="w-full">
          <Label htmlFor="rate_plan_name" className="text-sm font-medium">Rate Plan Name <span className="text-destructive">*</span></Label>
          <Input
            id="rate_plan_name"
            {...register("rate_plan_name")}
            placeholder="Rate plan name"
            className="w-full h-10"
            type="text"
          />
          {errors.rate_plan_name && (
            <p className="text-red-500 text-sm">{errors.rate_plan_name.message}</p>
          )}
        </div>

        {/* Rate plan description */}
        <div className="w-full">
          <Label htmlFor="rate_plan_description" className="text-sm font-medium">Rate Plan Description <span className="text-destructive">*</span></Label>
          <Input
            id="rate_plan_description"
            {...register("rate_plan_description")}
            placeholder="Rate plan description"
            className="w-full h-10"
            type="text"
          />
          {errors.rate_plan_description && (
            <p className="text-red-500 text-sm">{errors.rate_plan_description.message}</p>
          )}
        </div>

        {/* Min length stay and Max length stay */}
        <div className="grid grid-cols-2 gap-4">
          {/* Min length stay */}
          <div className="w-full">
            <Label htmlFor="min_length_stay" className="text-sm font-medium">Min Length Stay </Label>
            <Input
              id="min_length_stay"
              {...register("min_length_stay", { valueAsNumber: true })}
              placeholder="0"
              className="w-full h-10"
              type="number"
            />
            {errors.min_length_stay && (
              <p className="text-red-500 text-sm">{errors.min_length_stay.message}</p>
            )}
          </div>

          {/* Max length stay */}
          <div className="w-full">
            <Label htmlFor="max_length_stay" className="text-sm font-medium">Max Length Stay</Label>
            <Input
              id="max_length_stay"
              {...register("max_length_stay", { valueAsNumber: true })}
              placeholder="0"
              className="w-full h-10"
              type="number"
            />
            {errors.max_length_stay && (
              <p className="text-red-500 text-sm">{errors.max_length_stay.message}</p>
            )}
          </div>
        </div>

        {/* Min book advance and Max book advance */}
        <div className="grid grid-cols-2 gap-4">
          {/* Min book advance */}
          <div className="w-full">
            <Label htmlFor="min_book_advance" className="text-sm font-medium">Min Book Advance </Label>
            <Input
              id="min_book_advance"
              {...register("min_book_advance", { valueAsNumber: true })}
              placeholder="0"
              className="w-full h-10"
              type="number"
            />
            {errors.min_book_advance && (
              <p className="text-red-500 text-sm">{errors.min_book_advance.message}</p>
            )}
          </div>

          {/* Max book advance */}
          <div className="w-full">
            <Label htmlFor="max_book_advance" className="text-sm font-medium">Max Book Advance</Label>
            <Input
              id="max_book_advance"
              {...register("max_book_advance", { valueAsNumber: true })}
              placeholder="0"
              className="w-full h-10"
              type="number"
            />
            {errors.max_book_advance && (
              <p className="text-red-500 text-sm">{errors.max_book_advance.message}</p>
            )}
          </div>
        </div>

        {/* Room price for the selected plan */}
        <div className="w-full">
          <Label htmlFor="room_price" className="text-sm font-medium">Room Price <span className="text-destructive">*</span></Label>
          <Input
            id="room_price"
            {...register("room_price", { valueAsNumber: true })}
            placeholder="0"
            className="w-full h-10"
            type="number"
          />
          {errors.room_price && (
            <p className="text-red-500 text-sm">{errors.room_price.message}</p>
          )}
        </div>

        {/* Category pricing information */}
        {category?.length > 0 && (
          <div className="mt-4">
            {category.map((category: any, index: number) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                <p className="border p-2 rounded-md text-sm">Adult Price: {category.adultPrice}</p>
                <p className="border p-2 rounded-md text-sm">Children Price: {category.childrenPrice}</p>
                <p className="border p-2 rounded-md text-sm">Breakfast Price: {category.breakfastPrice}</p>
                <p className="border p-2 rounded-md text-sm">Lunch Price: {category.lunchPrice}</p>
                <p className="border p-2 rounded-md text-sm">Dinner Price: {category.dinnerPrice}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between px-6">
        <Button
          className="w-24"
          onClick={onPrevious}
          variant={"secondary"}
          type="button"
        >
          Back
        </Button>
        <Button
          className="w-24"
          type="submit"
          disabled={isSubmitting || loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </CardFooter>
    </form>
  );
}