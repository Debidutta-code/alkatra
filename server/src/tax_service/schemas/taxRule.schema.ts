import { z } from "zod";

/**
 * Strict validation for `POST /create`
 * All required fields from your Mongoose model must be present.
 */
const createTaxRuleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().nonnegative("Value must be >= 0"),
    applicableOn: z.enum(["ROOM_RATE", "TOTAL_AMOUNT"]),
    region: z.object({
        country: z.string().min(1, "Country is required"),
        state: z.string().optional(),
        city: z.string().optional(),
    }),
    description: z.string().optional(),
    validFrom: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    validTo: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    isInclusive: z.boolean().default(false),
    priority: z.number().optional(),
    hotelId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid Hotel ID"),
    // createdBy: z
    //     .string()
    //     .regex(/^[a-fA-F0-9]{24}$/, "Invalid Mongo ObjectId"),
});

/**
 * I have commented the createdBy field because the middlware doesn't provide createdBy as of now
 * We will receive the id at req.user for we'll validate it at controller layer
 */


/**
 * Concrete validation for `POST /create`
 * All fields are required and will be validated if provided.
 */
export const validateCreateTaxRule = createTaxRuleSchema.strict();


/**
 * Loose/partial validation for `PUT/PATCH /update`
 * All fields are optional but will still be validated if provided.
 */
export const validateUpdateTaxRule = createTaxRuleSchema.partial();
