import { ITaxGroup } from "../../models";


export class TaxGroupSanitizer {

    /**
     * Sanitizes the incoming request body for creating a tax group.
     * Removes disallowed fields like `code`.
     */
    public static sanitzeCreatePayload(raw: any): Partial<ITaxGroup> {
        const {
            name,
            rules,
            isActive,
            hotelId,
            createdBy
        } = raw;

        return {
            name: String(name).trim(),
            rules: rules,
            isActive: isActive,
            hotelId: hotelId,
            createdBy: createdBy
        };
    }

    /**
     * Sanitizes the payload for update operation
     * Ensures code and createdBy cannot be overridden
     */
    public static sanitizeUpdatePayload(raw: any): Partial<ITaxGroup> {
        const {
            name,
            rules,
            isActive,
        } = raw;

        const sanitized: Partial<ITaxGroup> = {};

        if (name !== undefined) sanitized.name = String(name).trim();
        if (rules !== undefined) sanitized.rules = rules;
        if (isActive !== undefined) sanitized.isActive = isActive;

        return sanitized;
    }

}