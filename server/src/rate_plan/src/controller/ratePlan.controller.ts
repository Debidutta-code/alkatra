import { NextFunction, Request, Response } from "express";
import { RatePlanService, RoomPriceService, RoomRentCalculationService } from "../service/ratePlan.service";
import { propertyInfoService } from "../../../property_management/src/container";
import { container } from "../../../tax_service/container";

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
            console.log("###################### Inside getRatePlanByHotelCode controller");
            const { hotelCode } = req.params;
            
            console.log("Entering into getRatePlanByHotelCode SERVICE");
            const response = await RatePlanService.getRatePlanByHotelCode(hotelCode);
            if (!response) {
                throw new Error("No rate plans found for this hotel code")
            }

            return response;
        } catch (error) {
            console.error("Error in getRatePlanByHotelCode controller:", error);
            next(error);
        }
    }

    public static async getRatePlanByHotel(req: Request, res: Response, next: NextFunction) {
        try {

            
            const { hotelCode } = req.body;
            if (!hotelCode) {
                throw new Error("Hotel code is required");
            }

            const {invTypeCode, ratePlanCode, startDate, endDate} = req.query;
            const page = req.query?.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query?.limit ? parseInt(req.query.limit as string) : 10;
            console.log(`The start date and end date we get ${startDate} and ${endDate}`);

            if (isNaN(page) || page < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Page must be a positive integer.',
                });
            }

            if (isNaN(limit) || limit < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit must be a positive integer.',
                });
            }

            console.log("Entering into getRatePlanByHotel SERVICE");
            const response = await RatePlanService.getRatePlanByHotel(
                hotelCode, 
                invTypeCode as string, 
                ratePlanCode as string, 
                startDate as string,
                endDate as string,
                page, 
                limit,                
            );
            if (!response) {
                throw new Error("No rate plans found for this hotel code")
            }

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
            noOfRooms
        } = req.body

        const response: any = await RoomRentCalculationService.getRoomRentService(
            hotelCode,
            invTypeCode,
            startDate,
            endDate,
            noOfChildrens,
            noOfAdults,
            noOfRooms
        )
        if (response.success === false) {
            console.error("Error in getRoomRentController:", response.message)
            return response;
        }


        /**
         * Total Price and Base Price for caculating tax
         */
        const totalPrice = response.data.totalAmount;
        const basePrice = response.data.breakdown.totalBaseAmount;

        /**
         * Get the property info for getting property ID
         */
        const propertyInfo: any = await propertyInfoService.getPropertyByHotelCode(hotelCode);

        /**
         * If tax group is not assigned to the property return the response
         */
        if (!propertyInfo.tax_group) return response;

        /**
         * Calculating tax
         */
        const taxCalculation = await container.taxGroupService.calculateTaxRulesForReservation(basePrice, totalPrice, propertyInfo.tax_group);

        /**
         * If taxCalculation is empty return the response
         */
        if (!taxCalculation) {
            response.data.tax = [];
            // response.data.totalTax = 0;
            // response.data.priceAfterTax = response.data.totalAmount;
            return response;
        }

        /**
         * Cummilative total amount
         */
        let totalAmount = 0;
        for (let i = 0, len = taxCalculation.length; i < len; i++) {
            totalAmount += taxCalculation[i].amount;
        }

        response.data.tax = taxCalculation;
        response.data.totalTax = totalAmount;
        response.data.priceAfterTax = Number((response.data.totalAmount + totalAmount).toFixed(2));

        return response
    }

    public static async getAllRoomTypeController(req: Request) {
        const hotelCode = req.query.hotelCode as string;
        if (!hotelCode) {
            throw new Error("Hotel code is required");
        }
        const response = await RoomPriceService.getAllRoomTypeService(hotelCode)
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