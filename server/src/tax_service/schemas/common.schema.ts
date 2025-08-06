import { z } from "zod";

// Only validates that `:id` is a valid MongoDB ObjectId
const objectIdParamSchema = z.object({
    id: z
        .string()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid Mongo ObjectId"),
});


export const validateObjectIdParam = objectIdParamSchema.safeParse;