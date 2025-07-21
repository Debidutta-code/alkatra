import { NextFunction, Request, Response } from "express";
import { RatePlanService, RoomPriceService, RoomRentCalculationService } from "../service/ratePlan.service";

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
            console.log("Update Rate")
            const inventoryId = req.params.id;
            const ratePlanData = req.body;
            const ratePlans = req.body.ratePlans
            const response = await RatePlanService.updateRatePlan(ratePlans);

            return response;
            return { success: false }
        } catch (error) {
            console.error("Error in updateRatePlan:", error);
            next(error);
        }
    }

    public static async getRatePlanByHotelCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotelCode } = req.params;

            const response = await RatePlanService.getRatePlanByHotelCode(hotelCode);

            return response;
        } catch (error) {
            console.error("Error in getRatePlanByHotelCode controller:", error);
            next(error);
        }
    }

    public static async getRatePlanByHotel(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotelCode, invTypeCode, startDate, endDate } = req.body;
            console.log(hotelCode, invTypeCode, startDate, endDate)
            const page = req.query?.page.toString()
            const response = await RatePlanService.getRatePlanByHotel(hotelCode, invTypeCode && invTypeCode, startDate && new Date(startDate), endDate && new Date(endDate), page && parseInt(page));

            return response;
        } catch (error) {
            console.error("Error in getRatePlanByHotelCode controller:", error);
            next(error);
        }
    }

}

class RoomPrice {

    public static async getRoomPriceByHotelCode(req: Request, res: Response, next: NextFunction) {

        const { hotelcode, invTypeCode } = req.query
        const response = await RoomPriceService.getRoomPriceService(hotelcode as string, invTypeCode as string)
        return response
    }

    public static async getRoomRentController(req: Request, res: Response, next: NextFunction) {
        const {
            hotelCode,
            invTypeCode,
            startDate,  
            endDate,
            noOfChildrens,
            noOfAdults,
            noOfRooms } = req.body
        const response = await RoomRentCalculationService.getRoomRentService(hotelCode,
            invTypeCode,
            startDate,
            endDate,
            noOfChildrens,
            noOfAdults,
            noOfRooms
        )
        if (response.success === false) {
            console.error("Error in getRoomRentController:", response.message)
            return;
        }
        console.log(`The response we get from Get-Room-Rent-Controller${JSON.stringify(response)}`)
        return response
    }

    public static async getAllRoomTypeController() {
        const response = await RoomPriceService.getAllRoomTypeService()
        console.log(response)
        return response
    }

    public static async checkAvailabilityController(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotelcode, invTypeCode, startDate, endDate, noOfRooms } = req.body
            const response = await RoomPriceService.checkAvailabilityService(hotelcode, invTypeCode, startDate, endDate, noOfRooms)

            return response
        } catch (error: any) {
            return {
                success: false,
                message: "Error occur while checking availability for this hotel",
                error: error.message
            }
        }
    }
}
export { RatePlanController, RoomPrice };   