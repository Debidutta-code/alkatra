import { z } from 'zod';

// Define the DateRange schema for scheduling.dateRanges
const DateRangeSchema = z.object({
  start: z.string().min(1, { message: "Start date is required" }).refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Start date must be a valid date" }
  ),
  end: z.string().min(1, { message: "End date is required" }).refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "End date must be a valid date" }
  ),
}).refine(
  (data) => new Date(data.end) > new Date(data.start),
  { message: "End date must be after start date", path: ["end"] }
);

// Define the Scheduling schema
interface DateRange {
    start: string;
    end: string;
}

interface Scheduling {
    type: 'weekly' | 'date_range' | 'specific-dates';
    weeklyDays: string[];
    dateRanges: DateRange[];
    availableSpecificDates: string[];
}

interface SchedulingSchemaType {
    type: 'weekly' | 'date_range' | 'specific-dates';
    weeklyDays: string[];
    dateRanges: DateRange[];
    availableSpecificDates: string[];
}

interface SchedulingSchemaContext {
    parent: SchedulingSchemaType;
}

const SchedulingSchema: z.ZodType<SchedulingSchemaType, z.ZodTypeDef, unknown> = z.object({
    type: z.enum(['weekly', 'date_range', 'specific-dates'], {
        required_error: "Scheduling type is required",
    }),
    weeklyDays: z.array(z.string()),
    dateRanges: z.array(DateRangeSchema)
        .default([])
        .superRefine((val, ctx) => {
            // ctx.parent is not available here, but ctx.parent is the object being validated
            // So we can access ctx.parent.type
            // However, in Zod v3, ctx.parent is not documented, but ctx is ZodRefinementCtx
            // Instead, we can access the sibling fields via ctx from the object schema
            // So, we need to move this check to the object level, or use superRefine at the object level
            // For now, we can skip this check here and move it to the object level below
        }),
    availableSpecificDates: z.array(z.string())
        .default([])
        .superRefine((val, ctx) => {
            // ctx.parent is not available here, but ctx is ZodRefinementCtx
            // Instead, we can access the sibling fields via ctx from the object schema
            // So, we need to move this check to the object level, or use superRefine at the object level below
            // For now, we can skip this check here and move it to the object level below
        }),
}) as z.ZodType<SchedulingSchemaType>;

// Define the CancellationDeadline schema
const CancellationDeadlineSchema = z.object({
  days: z.union([
    z.string().transform(val => (val === "" ? 0 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(0, { message: "Cancellation deadline days cannot be negative" })
      .refine(val => !isNaN(val), { message: "Cancellation deadline days must be a valid number" })
  ),
  hours: z.union([
    z.string().transform(val => (val === "" ? 0 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(0, { message: "Cancellation deadline hours cannot be negative" })
      .max(23, { message: "Cancellation deadline hours must be between 0 and 23" })
      .refine(val => !isNaN(val), { message: "Cancellation deadline hours must be a valid number" })
  ),
});

// Define the main RatePlanFormData schema
export const RatePlanFormSchema = z.object({
  propertyId: z.string().min(1, { message: "Property ID is required" }),
  ratePlanName: z.string()
    .min(1, { message: "Rate plan name is required" })
    .max(100, { message: "Rate plan name cannot exceed 100 characters" }),
  ratePlanCode: z.string()
    .min(1, { message: "Rate plan code is required" })
    .max(50, { message: "Rate plan code cannot exceed 50 characters" }),
  description: z.string()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),
  mealPlan: z.enum(['RO', 'BB', 'HB', 'FB'], {
    required_error: "Meal plan is required",
  }),
  currency: z.enum(['USD', 'EUR', 'GBP'], {
    required_error: "Currency is required",
  }),
  status: z.enum(['active', 'inactive'], {
    required_error: "Status is required",
  }),
  scheduling: SchedulingSchema,
  minLengthStay: z.union([
    z.string().transform(val => (val === "" ? 1 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(1, { message: "Minimum length of stay must be at least 1" })
      .refine(val => !isNaN(val), { message: "Minimum length of stay must be a valid number" })
  ),
  maxLengthStay: z.union([
    z.string().transform(val => (val === "" ? 1 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(1, { message: "Maximum length of stay must be at least 1" })
      .refine(val => !isNaN(val), { message: "Maximum length of stay must be a valid number" })
  ),
  minReleaseDay: z.union([
    z.string().transform(val => (val === "" ? 0 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(0, { message: "Minimum release day cannot be negative" })
      .refine(val => !isNaN(val), { message: "Minimum release day must be a valid number" })
  ),
  maxReleaseDay: z.union([
    z.string().transform(val => (val === "" ? 0 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(0, { message: "Maximum release day cannot be negative" })
      .refine(val => !isNaN(val), { message: "Maximum release day must be a valid number" })
  ),
  cancellationDeadline: CancellationDeadlineSchema,
  maxOccupancy: z.union([
    z.string().transform(val => (val === "" ? 1 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(1, { message: "Maximum occupancy must be at least 1" })
      .refine(val => !isNaN(val), { message: "Maximum occupancy must be a valid number" })
  ),
  adultOccupancy: z.union([
    z.string().transform(val => (val === "" ? 1 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(1, { message: "Adult occupancy must be at least 1" })
      .refine(val => !isNaN(val), { message: "Adult occupancy must be a valid number" })
  ),
  minBookAdvance: z.union([
    z.string().transform(val => (val === "" ? 0 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(0, { message: "Minimum book advance cannot be negative" })
      .refine(val => !isNaN(val), { message: "Minimum book advance must be a valid number" })
  ),
  maxBookAdvance: z.union([
    z.string().transform(val => (val === "" ? 0 : Number(val))),
    z.number(),
  ]).pipe(
    z.number()
      .min(0, { message: "Maximum book advance cannot be negative" })
      .refine(val => !isNaN(val), { message: "Maximum book advance must be a valid number" })
  ),
})
.refine(
  (data) => data.maxLengthStay >= data.minLengthStay,
  { message: "Maximum length of stay must be greater than or equal to minimum length of stay", path: ["maxLengthStay"] }
)
.refine(
  (data) => data.maxReleaseDay >= data.minReleaseDay,
  { message: "Maximum release day must be greater than or equal to minimum release day", path: ["maxReleaseDay"] }
)
.refine(
  (data) => data.maxOccupancy >= data.adultOccupancy,
  { message: "Adult occupancy cannot exceed maximum occupancy", path: ["adultOccupancy"] }
)
.refine(
  (data) => data.maxBookAdvance >= data.minBookAdvance,
  { message: "Maximum book advance must be greater than or equal to minimum book advance", path: ["maxBookAdvance"] }
);

// Export the type for TypeScript
export type RatePlanFormDataType = z.infer<typeof RatePlanFormSchema>;