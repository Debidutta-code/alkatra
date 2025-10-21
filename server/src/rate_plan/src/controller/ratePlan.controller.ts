import { NextFunction, Request, Response } from "express";
import { RatePlanService, RoomPriceService, RoomRentCalculationService } from "../service/ratePlan.service";
import { propertyInfoService } from "../../../property_management/src/container";
import { container } from "../../../tax_service/container";
import { ReservationService, InventoryService } from "../service";
import { ReservationDao } from "../dao";
import { Promocode } from "../../../property_management/src/model";
import couponModel from "../../../coupon_management/model/couponModel";



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

            const { invTypeCode, ratePlanCode, startDate, endDate } = req.query;
            const page = req.query?.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query?.limit ? parseInt(req.query.limit as string) : 10;


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

    private reservationService: ReservationService;
    private reservationDao: ReservationDao;

    constructor() {
        this.reservationDao = ReservationDao.getInstance();
        this.reservationService = ReservationService.getInstance(this.reservationDao);
    }

    public static async getRoomPriceByHotelCode(req: Request, res: Response, next: NextFunction) {

        const { hotelcode, invTypeCode } = req.query
        const response = await RoomPriceService.getRoomPriceService(hotelcode as string, invTypeCode as string)
        return response
    }


    /**
     * 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */

    public static async getRoomRentController(req: Request, res: Response, next: NextFunction): Promise<any> {
        const reservationDao = ReservationDao.getInstance();
        const reservationService = ReservationService.getInstance(reservationDao);

        const {
            hotelCode,
            invTypeCode,
            // ratePlanCode,
            startDate,
            endDate,
            noOfChildren,
            noOfAdults,
            noOfRooms
        } = req.body;

        const { reservationId } = req.query;

        let discountAmount = 0;``
        let reservationTaxValue: number | null = null;
        let couponDetailsMap = new Map();

        // First get the room rent calculation
        const response: any = await RoomRentCalculationService.getRoomRentService(
            hotelCode,
            invTypeCode,
            // ratePlanCode,
            startDate,
            endDate,
            noOfChildren,
            noOfAdults,
            noOfRooms
        );
        if (response.success === false) {
            console.error("Error in getRoomRentController:", response.message);
            return response;
        }

        /**
         * Total Price and Base Price for calculating tax
         */
        let totalPrice = response.data.totalAmount;
        const originalBasePrice = response.data.breakdown.totalBaseAmount;

        // Store original values before any modifications
        const originalTotalAmount = response.data.totalAmount;
        const originalBreakdown = { ...response.data.breakdown };
        const originalDailyBreakdown = response.data.dailyBreakdown ? [...response.data.dailyBreakdown] : [];

        if (reservationId) {
            const reservationData = await reservationService.getReservationById(reservationId.toString());
            if (!reservationData) {
                throw new Error("Reservation not found for the provided ID");
            }

            // Get tax value from reservation if available
            if (reservationData.taxValue !== undefined && reservationData.taxValue !== null && Number(reservationData.taxValue) >= 0) {
                reservationTaxValue = Number(reservationData.taxValue);
            }

            // Process coupons from reservation
            if (reservationData.coupon && reservationData.coupon.length > 0) {
                const uniqueCouponCodes = [...new Set(reservationData.coupon)];

                if (uniqueCouponCodes.length > 0) {
                    const [promoCodes, couponModels] = await Promise.all([
                        Promocode.find({
                            $or: [
                                { code: { $in: uniqueCouponCodes } },
                                { codeName: { $in: uniqueCouponCodes } }
                            ]
                        })
                            .select('code codeName discountType discountValue minBookingAmount maxDiscountAmount'),
                        couponModel.find({ code: { $in: uniqueCouponCodes } })
                            .select('code discountPercentage')
                    ]);

                    promoCodes.forEach(coupon => {
                        const couponData = {
                            discountType: coupon.discountType,
                            discountValue: coupon.discountValue,
                            minBookingAmount: coupon.minBookingAmount,
                            maxDiscountAmount: coupon.maxDiscountAmount,
                            source: 'promocode',
                            code: coupon.code,
                            codeName: coupon.codeName
                        };

                        // Store only once using the actual coupon code from reservation
                        if (uniqueCouponCodes.includes(coupon.code)) {
                            couponDetailsMap.set(coupon.code, couponData);
                        } else if (uniqueCouponCodes.includes(coupon.codeName)) {
                            couponDetailsMap.set(coupon.codeName, couponData);
                        }
                    });

                    couponModels.forEach(coupon => {
                        couponDetailsMap.set(coupon.code, {
                            discountPercentage: coupon.discountPercentage,
                            source: 'couponModel',
                            code: coupon.code
                        });
                    });

                    // Calculate discount amount using the service method
                    discountAmount = await reservationService.calculateDiscountedPrice(reservationId.toString(), originalBasePrice);
                }
            }
        }

        /**
         * Get the property info for getting property ID
         */
        const propertyInfo: any = await propertyInfoService.getPropertyByHotelCode(hotelCode);

        /**
         * Calculate tax and final price - CORRECTED FLOW
         */
        let totalTax = 0;
        let priceAfterTax = totalPrice;

        /**
         * If reservation has tax value (and it's not negative), use it instead of default tax calculation
         */
        if (reservationTaxValue !== null) {
            // STEP 1: Start from base price
            totalPrice = originalBasePrice;

            // STEP 2: Add tax to base price
            totalTax = reservationTaxValue;
            const priceWithTax = totalPrice + totalTax;

            // STEP 3: Apply discount on tax-added price
            let finalPrice = priceWithTax;
            if (discountAmount > 0) {
                let discountOnTaxedPrice = discountAmount;

                // Check if it's a percentage discount (from couponDetailsMap)
                const couponDetails = Array.from(couponDetailsMap.values())[0]; // Get first coupon
                if (couponDetails && couponDetails.discountType === 'percentage') {
                    // For percentage discounts, apply percentage to taxed amount
                    const discountOnTaxedPrice = priceWithTax * (couponDetails.discountValue / 100);
                    finalPrice = Math.max(0, priceWithTax - discountOnTaxedPrice);
                    response.data.promoDiscount = Number(discountOnTaxedPrice.toFixed(2));
                } else {
                    // For flat discounts, use the discountAmount directly
                    finalPrice = Math.max(0, priceWithTax - discountAmount);
                    response.data.promoDiscount = Number(discountAmount.toFixed(2));
                }

                console.log(`Price Calculation: Base(${originalBasePrice}) + Tax(${totalTax}) = ${priceWithTax} - Discount(${response.data.promoDiscount}) = ${finalPrice}`);
            }

            // STEP 4: Update the response with final calculated values
            response.data.tax = [{
                name: 'Reservation Tax',
                amount: totalTax,
                type: 'fixed'
            }];
            response.data.totalTax = totalTax;
            response.data.priceAfterTax = Number(finalPrice.toFixed(2));
            response.data.totalAmount = Number(finalPrice.toFixed(2));

            // Also update breakdown accordingly
            response.data.breakdown.totalBaseAmount = Number(originalBasePrice.toFixed(2));
            response.data.breakdown.totalAmount = Number(finalPrice.toFixed(2));
            response.data.breakdown.averagePerNight = Number((finalPrice / response.data.breakdown.numberOfNights).toFixed(2));

            // Update daily breakdown to reflect the final amounts
            if (response.data.dailyBreakdown && response.data.dailyBreakdown.length > 0) {
                const totalOriginalDailyAmount = originalDailyBreakdown.reduce((sum, day) => sum + day.totalForAllRooms, 0);
                const discountRatio = totalOriginalDailyAmount > 0 ? (discountAmount / totalOriginalDailyAmount) : 0;

                response.data.dailyBreakdown.forEach((day, index) => {
                    const originalDayAmount = originalDailyBreakdown[index]?.totalForAllRooms || 0;
                    const dayDiscount = originalDayAmount * discountRatio;
                    const dayTax = originalDayAmount > 0 ? (totalTax * (originalDayAmount / totalOriginalDailyAmount)) : 0;

                    const finalDayAmount = Math.max(0, originalDayAmount + dayTax - dayDiscount);
                    day.totalForAllRooms = Number(finalDayAmount.toFixed(2));
                });
            }

        } else {
            /**
             * Default tax calculation (only if no reservation tax value or reservation tax value is negative)
             */
            if (propertyInfo.tax_group) {
                const taxCalculation = await container.taxGroupService.calculateTaxRulesForReservation(totalPrice, totalPrice, propertyInfo.tax_group);

                if (taxCalculation) {
                    let totalAmount = 0;
                    for (let i = 0, len = taxCalculation.length; i < len; i++) {
                        totalAmount += taxCalculation[i].amount;
                    }

                    response.data.tax = taxCalculation;
                    totalTax = totalAmount;

                    // For default tax calculation: Apply tax first, then discount
                    let priceWithTax = totalPrice + totalTax;
                    if (discountAmount > 0) {
                        priceWithTax = Math.max(0, priceWithTax - discountAmount);
                        response.data.promoDiscount = Number(discountAmount.toFixed(2));
                    }

                    priceAfterTax = Number(priceWithTax.toFixed(2));
                    response.data.totalAmount = priceAfterTax;

                    // Update breakdown
                    response.data.breakdown.totalAmount = priceAfterTax;
                    response.data.breakdown.averagePerNight = Number((priceAfterTax / response.data.breakdown.numberOfNights).toFixed(2));
                } else {
                    response.data.tax = [];
                    // Apply discount even if no tax
                    if (discountAmount > 0) {
                        priceAfterTax = Math.max(0, totalPrice - discountAmount);
                        response.data.promoDiscount = Number(discountAmount.toFixed(2));
                        response.data.totalAmount = priceAfterTax;
                        response.data.breakdown.totalAmount = priceAfterTax;
                        response.data.breakdown.averagePerNight = Number((priceAfterTax / response.data.breakdown.numberOfNights).toFixed(2));
                    }
                }
            } else {
                // No tax group - just apply discount if any
                if (discountAmount > 0) {
                    priceAfterTax = Math.max(0, totalPrice - discountAmount);
                    response.data.promoDiscount = Number(discountAmount.toFixed(2));
                    response.data.totalAmount = priceAfterTax;
                    response.data.breakdown.totalAmount = priceAfterTax;
                    response.data.breakdown.averagePerNight = Number((priceAfterTax / response.data.breakdown.numberOfNights).toFixed(2));
                }
            }

            // Apply the final calculated values for default tax case
            response.data.totalTax = totalTax;
            response.data.priceAfterTax = priceAfterTax;
        }

        // Add coupon details to response (remove duplicates)
        if (couponDetailsMap.size > 0) {
            const uniqueCouponDetails = {};
            const processedCodes = new Set();

            couponDetailsMap.forEach((value, key) => {
                // Only add if not already added (avoid code/codeName duplicates)
                const codeToCheck = value.code || value.codeName;
                if (codeToCheck && !processedCodes.has(codeToCheck)) {
                    uniqueCouponDetails[key] = value;
                    processedCodes.add(codeToCheck);
                }
            });
            response.data.couponDetails = uniqueCouponDetails;
        }

        return response;
    }

    /**
     * 
     */

    public static async getAllRoomTypeController(req: Request) {
        const hotelCode = req.query.hotelCode as string;
        if (!hotelCode) {
            throw new Error("Hotel code is required");
        }
        const response = await RoomPriceService.getAllRoomTypeService(hotelCode);
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

export class StartStopWatcher {
    private inventoryService: InventoryService;

    constructor(inventoryService: InventoryService) {
        if (!inventoryService) {
            throw new Error("InventoryService is required");
        }
        this.inventoryService = inventoryService;
    }

    async updateStartStopSell(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotelCode, invTypeCode, dateStatusList } = req.body;

            /**
             * Validate invTypeCode is an array
             */
            if (!Array.isArray(invTypeCode)) {
                return res.status(400).json({
                    success: false,
                    message: "Room Type code must be an array"
                });
            }


            /**
             * Validate dateStatusList is an array
             */
            if (!Array.isArray(dateStatusList)) {
                return res.status(400).json({
                    success: false,
                    message: "dateStatusList must be an array"
                });
            }

            /**
             * Validate each item in dateStatusList
             */
            for (const item of dateStatusList) {
                if (!item.date || !item.status || !['open', 'close'].includes(item.status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Each item must have a valid date and status ('open' or 'close')"
                    });
                }
            }

            const response = await this.inventoryService.updateInventory(hotelCode, invTypeCode, dateStatusList);
            if (!response) {
                return res.status(404).json({
                    success: false,
                    message: "Status not changed successfully",
                });
            }

            const sanitizedResponse = {
                matchedCount: response.matchedCount,
                modifiedCount: response.modifiedCount,
            };

            return res.status(200).json({
                success: true,
                message: "Inventory updated successfully",
                data: sanitizedResponse,
            });
        }
        catch (error: any) {
            console.log("Start Stop Sell: Server Error");
            return res.status(500).json({
                success: false,
                message: error.message || "Start Stop sell status update failed",
            });
        }
    }
}

export { RatePlanController, RoomPrice };   