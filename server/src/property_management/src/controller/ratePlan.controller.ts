import { NextFunction, Response } from "express";
import { RatePlanService } from "../service";

interface BaseGuestAmount {
    numberOfGuests: number;
    amountBeforeTax: number;
}

interface AdditionalGuestAmount {
    ageQualifyingCode: number;
    amount: number;
}

interface DaysOfWeek {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
}

interface CreateRatePlanRequest {
    hotelCode: string;
    invTypeCode: string;
    ratePlanCode: string;
    startDate: string;
    endDate: string;
    currencyCode: string;
    days: DaysOfWeek;
    baseGuestAmounts: BaseGuestAmount[];
    additionalGuestAmounts: AdditionalGuestAmount[];
}

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
        }
        catch (error: any) {
            console.log("Error in createRatePlan controller:", error);
            return res.status(500).json({ message: "Error while creating rate plan" });
        }
    }
}