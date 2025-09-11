import { NextFunction, Response } from "express";
import { RatePlanService } from "../service";
import { CreateRatePlanRequest } from "../interface";

class RatePlanHotelier {

    private ratePlanService: RatePlanService;
    constructor() {
        this.ratePlanService = RatePlanService.getInstance();
    }

    async createRatePlan(req: any, res: Response, next: NextFunction) {
        try {
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

            const data: CreateRatePlanRequest = {
                hotelCode,
                invTypeCode,
                ratePlanCode,
                startDate,
                endDate,
                currencyCode,
                days,
                baseGuestAmounts,
                additionalGuestAmounts
            };

            const ratePlanCreateResult = await this.ratePlanService.ratePlanCreate({ data });
            if (!ratePlanCreateResult) {
                return res.status(400).json({ message: "Failed to create rate plan" });
            }

            return res.status(201).json({ message: "Rate plan created successfully", data: ratePlanCreateResult } );

        }
        catch (error: any) {
            console.log("Error in createRatePlan controller:", error);
            return res.status(500).json({ message: "Error while creating rate plan" });
        }
    }
}