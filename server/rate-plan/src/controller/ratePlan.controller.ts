import { NextFunction, Request, Response } from "express";
import { RatePlanService } from "../service/ratePlan.service";

class RatePlanController {
    public static async createRatePlan(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { propertyId,
                ratePlanName,
                ratePlanCode,
                description,
                type,
                weeklyDays,
                dateRanges,
                availableSpecificDates,
                mealPlan,
                minLengthStay,
                maxLengthStay,
                minReleaseDay,
                maxReleaseDay,
                cancellationDeadline,
                currency,
                status,
                createdBy,
                updatedBy,


            } = req.body;

            const ratePlanData = {
                propertyId,
                ratePlanName,
                ratePlanCode,
                description,
                type,
                weeklyDays,
                dateRanges,
                availableSpecificDates,
                mealPlan,
                minLengthStay,
                maxLengthStay,
                minReleaseDay,
                maxReleaseDay,
                cancellationDeadline,
                currency,
                status,
                createdBy,
                updatedBy
            };


            const response = await RatePlanService.createRatePlan(ratePlanData);

            return response;
        } catch (error) {
            console;
            next(error);
        }
    }

    public static async updateRatePlan(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const inventoryId = req.params.id;
            const ratePlanData = req.body;

            const response = await RatePlanService.updateRatePlan(inventoryId, ratePlanData);

            return response;
        } catch (error) {
            console.error("Error in updateRatePlan:", error);
            next(error);
        }
    }

    public static async getRatePlanByHotelCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotelCode, invTypeCode, startDate, endDate } = req.body;
            console.log( hotelCode, invTypeCode, startDate, endDate )
            const page=req.query.page.toString()
            const response = await RatePlanService.getRatePlanByHotelCode(hotelCode, invTypeCode&&invTypeCode, startDate&&new Date(startDate), endDate&&new Date(endDate),page&&parseInt(page));

            return response;
        } catch (error) {
            console.error("Error in getRatePlanByHotelCode controller:", error);
            next(error);
        }
    }
}
export { RatePlanController };