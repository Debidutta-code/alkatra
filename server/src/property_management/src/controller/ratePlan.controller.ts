import { NextFunction, Response } from "express";
import { RatePlanService } from "../service";
import { CreateRatePlanRequest } from "../interface";
import { AuthenticatedRequest } from "../../../tax_service/interfaces";

export class RatePlanHotelier {

    private ratePlanService: RatePlanService;
    constructor() {
        this.ratePlanService = RatePlanService.getInstance();
    }

    async createRatePlan(req: any, res: Response) {
        const {
            hotelCode,
            invTypeCode,
            ratePlanCode,
            startDate,
            endDate,
            currencyCode,
            days,
            baseGuestAmounts,
            additionalGuestAmounts
        } = req.body;

        try {
            // Validate required fields
            if (!hotelCode || !invTypeCode || !ratePlanCode || !startDate || !endDate || !currencyCode) {
                return res.status(400).json({ message: "Missing required fields: hotelCode, invTypeCode, ratePlanCode, startDate, endDate, currencyCode" });
            }

            // Convert string dates to Date objects if needed
            const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
            const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;

            // Validate dates are valid
            if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                return res.status(400).json({ message: "Invalid date format. Use ISO format (YYYY-MM-DD)" });
            }

            // Validate date range
            if (startDateObj >= endDateObj) {
                return res.status(400).json({ message: "Start date cannot be greater than or equal to end date" });
            }

            // Check if dates are in the past
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at midnight

            if (startDateObj < today || endDateObj < today) {
                return res.status(400).json({ message: "Dates cannot be in the past" });
            }

            // Validate baseGuestAmounts
            if (!baseGuestAmounts || !Array.isArray(baseGuestAmounts) || baseGuestAmounts.length === 0) {
                return res.status(400).json({ message: "At least one base guest amount is required" });
            }

            // Validate currency code
            if (currencyCode.length !== 3) {
                return res.status(400).json({ message: "Currency code must be 3 characters (e.g., USD, EUR)" });
            }

            const data: CreateRatePlanRequest = {
                hotelCode,
                invTypeCode,
                ratePlanCode,
                startDate: startDateObj,
                endDate: endDateObj,
                currencyCode: currencyCode.toUpperCase(),
                days,
                baseGuestAmounts,
                additionalGuestAmounts: additionalGuestAmounts
            };

            const ratePlanCreateResult = await this.ratePlanService.ratePlanCreate(data);
            if (!ratePlanCreateResult) {
                return res.status(400).json({ message: "Failed to create rate plan" });
            }

            return res.status(201).json({ message: "Rate plan created successfully", data: ratePlanCreateResult });

        } catch (error: any) {
            console.log("Error in createRatePlan controller:", error);
            return res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
}