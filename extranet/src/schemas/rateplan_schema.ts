import { z } from "zod";

export const createRatePlanSchema = z.object({
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