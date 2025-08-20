import { ITaxRule } from "../../models";

export class TaxRuleSanitizer {
    /**
     * Sanitizes the incoming request body for creating a tax rule.
     * Removes disallowed fields like `code`.
     */
    public static sanitizeCreatePayload(raw: any): Partial<ITaxRule> {
        const {
            name,
            type,
            value,
            applicableOn,
            region,
            description,
            validFrom,
            validTo,
            isInclusive = false,
            priority = 0,
            hotelId,
            createdBy,
        } = raw;
        
        return {
            name: String(name).trim(),
            type: type,
            value: Number(value),
            applicableOn: applicableOn,
            region: {
                country: String(region?.country).trim(),
                state: region?.state?.trim(),
                city: region?.city?.trim(),
            },
            description: description ? String(description).trim() : undefined,
            validFrom: new Date(validFrom),
            validTo: validTo ? new Date(validTo) : undefined,
            isInclusive: isInclusive,
            priority: priority,
            hotelId: hotelId,
            createdBy: createdBy,
        };
    }

    /**
     * Sanitizes the payload for update operation
     */
    public static sanitizeUpdatePayload(raw: any): Partial<ITaxRule> {
        const {
            name,
            type,
            value,
            applicableOn,
            region,
            description,
            validFrom,
            validTo,
            isInclusive,
            priority,
            hotelId,
            createdBy,
        } = raw;

        const sanitized: Partial<ITaxRule> = {};

        if (name !== undefined) sanitized.name = String(name).trim();
        if (type !== undefined) sanitized.type = type;
        if (value !== undefined) sanitized.value = Number(value);
        if (applicableOn !== undefined) sanitized.applicableOn = applicableOn;

        if (region) {
            sanitized.region = {
                country: String(region?.country).trim(),
                state: region?.state?.trim(),
                city: region?.city?.trim(),
            };
        }

        if (description !== undefined) sanitized.description = description ? String(description).trim() : undefined;
        if (validFrom !== undefined) sanitized.validFrom = new Date(validFrom);
        if (validTo !== undefined) sanitized.validTo = new Date(validTo);
        if (isInclusive !== undefined) sanitized.isInclusive = isInclusive;
        if (priority !== undefined) sanitized.priority = priority;
        if (hotelId !== undefined) sanitized.hotelId = hotelId;
        if (createdBy !== undefined) sanitized.createdBy = createdBy;

        return sanitized;
    }
}
