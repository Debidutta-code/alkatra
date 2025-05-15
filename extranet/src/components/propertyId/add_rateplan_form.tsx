import React from 'react'
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createRatePlanSchema = z.object({
    applicable_room_type: z.string(),
    meal_plan: z.string().min(1, "Meal plan is required"),
    room_price: z.number().nonnegative("Room price must be a positive number"),
    rate_plan_name: z.string().min(1, "Rate plan name is required"),
    rate_plan_description: z.string().min(1, "Rate plan description is required").optional(),
    min_length_stay: z.number().nonnegative("Minimum length stay must be a positive number"),
    max_length_stay: z.number().nonnegative("Maximum length stay must be a positive number").optional(),
    min_book_advance: z.number().nonnegative("Minimum book advance must be a positive number"),
    max_book_advance: z.number().nonnegative("Maximum book advance must be a positive number").optional(),
});

type Inputs = {
    applicable_room_type: string,
    meal_plan: string,
    room_price: number,
    rate_plan_name: string,
    rate_plan_description?: string,
    min_length_stay: number,    // minimum days a guest can stay
    max_length_stay?: number,    // maximum days a guest can stay
    min_book_advance: number,   // advance booking, minimum days before arrival
    max_book_advance?: number    // advance booking, maximum days before arrival
};

export const AddRatePlanForm = (arrayOfRooms: any) => {

    const form = useForm<Inputs>({
        defaultValues: {
            applicable_room_type: "",
            meal_plan: "",
            room_price: 0,
            rate_plan_name: "",
            rate_plan_description: "",
            min_length_stay: 0,    // minimum days a guest can stay
            max_length_stay: 0,    // maximum days a guest can stay
            min_book_advance: 0,   // advance booking, minimum days before arrival
            max_book_advance: 0,    // advance booking, maximum days before arrival
        },
        resolver: zodResolver(createRatePlanSchema),
    });
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, getValues } = form;

    return (
        <form onSubmit={handleSubmit((data) => console.log(data))}>
            <div className='flex flex-col gap-2'>
                <label htmlFor="applicable_room_type">Applicable for room type</label>
                <select
                    className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm focus:outline-white h-12"
                    {...register("applicable_room_type")}
                // onChange={handleSelectChange}
                >
                    <option value="">Select a rate plan</option>
                    {arrayOfRooms?.map((room: any) => (
                        room.rateplan_created === false &&
                        <option key={room._id} value={room.room_name}>
                            {room.room_name}
                        </option>
                    ))}
                </select>
                {/* <select
                    id='applicable_room_type'
                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                    style={{ width: "400px" }}
                    onChange={(e) => {
                        // const selected = ratePlanList.find(plan => plan.price_category === e.target.value);
                        // selected && setSelectedRatePlan(selected);
                    }}
                >
                    <option value="">Select a rate plan</option>
                    {arrayOfRooms?.map((room: any) => (
                        room.rateplan_created === false &&
                        <option key={room._id} value={room.room_name}>
                            {room.room_name}
                        </option>
                    ))}
                </select> */}
            </div>

            <button type='submit'>Submit</button>
        </form>
    )
}
