import { z } from "zod";

/**
 * Validation schema for `POST /create` TaxGroup
 */
const createTaxGroupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    rules: z.array(
        z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid Tax Rule ID")
    ).min(1, "At least one tax rule is required"),
    isActive: z.boolean().default(true),
    hotelId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid Hotel ID"),
    // createdBy will be taken from `req.user` – same as in TaxRule
});

/**
 * Strict validator for creating a tax group
 */
export const validateCreateTaxGroup = createTaxGroupSchema.strict();

/**
 * Partial validator for updating a tax group
 */
export const validateUpdateTaxGroup = createTaxGroupSchema.partial();
