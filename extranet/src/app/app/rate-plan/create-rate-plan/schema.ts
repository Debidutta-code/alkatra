import { z } from 'zod';

export const createRatePlanSchema = z.object({
  hotelCode: z.string().min(1, "Hotel code is required"),
  invTypeCode: z.string().min(1, "Room type is required"),
  ratePlanCode: z.string().min(1, "Rate plan name is required"),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid start date"),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid end date"),
  currencyCode: z.string().min(1, "Currency is required"),
  days: z.object({
    mon: z.boolean(),
    tue: z.boolean(),
    wed: z.boolean(),
    thu: z.boolean(),
    fri: z.boolean(),
    sat: z.boolean(),
    sun: z.boolean(),
  }),
  baseGuestAmounts: z.array(z.object({
    numberOfGuests: z.number().min(1, "Number of guests is required"),
    amountBeforeTax: z.number().min(0.01, "Amount must be greater than 0")
  })).min(1, "At least one base guest pricing is required"),
  
  additionalGuestAmounts: z.array(z.object({
    ageQualifyingCode: z.number().min(1, "Age category is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0")
  })).min(1, "At least one additional guest charge is required"),
});

export type CreateRatePlanFormData = z.infer<typeof createRatePlanSchema>;