import RateAmount from "../../../wincloud/src/model/ratePlanDateWise.model"
import { Inventory } from "../../../wincloud/src/model/inventoryModel"
class HotelPricesDao {

    public static async getHotelPlans(hotelCode: string, invTypeCode: string) {
        const result = await RateAmount.find({ hotelCode: hotelCode, invTypeCode: invTypeCode }).select("baseByGuestAmts currencyCode")
        return result
    }

    public static async getInventory(hotelCode: string, invTypeCode: string, start: Date, end: Date) {
        return await Inventory.find({
            hotelCode: hotelCode,
            invTypeCode: invTypeCode,
            $or: [{ "availability.startDate": { $gte: start, $lte: end } },
            { "availability.endDate": { $gte: start, $lte: end } },
            {
                $and: [
                    { "availability.startDate": { $lte: start } },
                    { "availability.endDate": { $gte: end } }
                ]
            }]
        })
    }

    public static async getRateAmount(hotelCode: string, invTypeCode: string, start: Date, end: Date) {
        return await RateAmount.find({
            hotelCode: hotelCode,
            invTypeCode: invTypeCode,
            $or: [{ "startDate": { $gte: start, $lte: end } },
            { "endDate": { $gte: start, $lte: end } },
            {
                $and: [
                    { "startDate": { $lte: start } },
                    { "endDate": { $gte: end } }
                ]
            }]
        })
    }

    // public static async getInventoryWithRates(hotelCode: string, invTypeCode: string, start: Date, end: Date) {

    //     const pipeline = [
    //         // Stage 1: Match inventory records - ONLY by startDate
    //         {
    //             $match: {
    //                 hotelCode: hotelCode,
    //                 invTypeCode: invTypeCode,
    //                 "availability.startDate": { $gte: start, $lte: end }
    //             }
    //         },

    //         // Stage 2: Lookup rates from RateAmount collection
    //         {
    //             $lookup: {
    //                 from: 'rateamountdatewises',
    //                 let: {
    //                     hotelCode: '$hotelCode',
    //                     invTypeCode: '$invTypeCode',
    //                     invStartDate: '$availability.startDate',
    //                     invEndDate: '$availability.endDate'
    //                 },
    //                 pipeline: [
    //                     {
    //                         $match: {
    //                             $expr: {
    //                                 $and: [
    //                                     { $eq: ['$hotelCode', '$$hotelCode'] },
    //                                     { $eq: ['$invTypeCode', '$$invTypeCode'] },
    //                                     // Only match rates that start within the inventory period
    //                                     { $gte: ['$startDate', '$$invStartDate'] },
    //                                     { $lte: ['$startDate', '$$invEndDate'] }
    //                                 ]
    //                             }
    //                         }
    //                     },
    //                     {
    //                         $addFields: {
    //                             dateMatch: {
    //                                 $and: [
    //                                     { $gte: ['$startDate', '$$invStartDate'] },
    //                                     { $lte: ['$startDate', '$$invEndDate'] }
    //                                 ]
    //                             }
    //                         }
    //                     },
    //                     // Limit to 1 since you expect only one rate per day
    //                     {
    //                         $limit: 1
    //                     }
    //                 ],
    //                 as: 'rates'
    //             }
    //         },
    //         // Stage 3: Project the final structure with rate as object instead of array
    //         {
    //             $project: {
    //                 hotelCode: 1,
    //                 hotelName: 1,
    //                 invTypeCode: 1,
    //                 inventory: {
    //                     availability: {
    //                         startDate: '$availability.startDate',
    //                         endDate: '$availability.endDate',
    //                         count: '$availability.count'
    //                     }
    //                 },
    //                 rate: {
    //                     $cond: {
    //                         if: { $gt: [{ $size: '$rates' }, 0] },
    //                         then: {
    //                             ratePlanCode: { $arrayElemAt: ['$rates.ratePlanCode', 0] },
    //                             startDate: { $arrayElemAt: ['$rates.startDate', 0] },
    //                             endDate: { $arrayElemAt: ['$rates.endDate', 0] },
    //                             days: { $arrayElemAt: ['$rates.days', 0] },
    //                             currencyCode: { $arrayElemAt: ['$rates.currencyCode', 0] },
    //                             baseByGuestAmts: { $arrayElemAt: ['$rates.baseByGuestAmts', 0] },
    //                             additionalGuestAmounts: { $arrayElemAt: ['$rates.additionalGuestAmounts', 0] },
    //                             dateMatch: { $arrayElemAt: ['$rates.dateMatch', 0] }
    //                         },
    //                         else: null
    //                     }
    //                 }
    //             }
    //         }
    //     ];

    //     try {

    //         const results = await Inventory.aggregate(pipeline).exec();
    //         // results.map((item) => {
    //         //     console.log(item)
    //         //     console.log(item.rate) 
    //         // })

    //         return results
    //     } catch (error) {
    //         console.error('Error in aggregation pipeline:', error);
    //         throw error;
    //     }
    // }
    public static async getInventoryWithRates(
        hotelCode: string,
        invTypeCode: string,
        noOfChildren: number,
        noOfAdults: number,
        noOfRooms: number,
        start: Date,
        end: Date
    ) {
        try {
            // Get inventory data separately
            const inventoryData = await this.getInventoryData(hotelCode, invTypeCode, start, end);

            // Get rate data separately
            const rateData = await this.getRateData(hotelCode, invTypeCode, start, end);

            // Combine the data with price calculation
            const combinedResults = this.combineInventoryWithRates(
                inventoryData,
                rateData,
                noOfAdults,
                noOfChildren,
                noOfRooms
            );

            return combinedResults;
        } catch (error) {
            console.error('Error in getInventoryWithRates:', error);
            throw error;
        }
    }

    /**
     * Helper functions
     * @param hotelCode 
     * @param invTypeCode 
     * @param startDate 
     * @param endDate 
     * @returns 
     */
    /**
 * Get inventory data separately
 */
    private static async getInventoryData(
        hotelCode: string,
        invTypeCode: string,
        start: Date,
        end: Date
    ) {
        try {
            const inventory = await Inventory.find({
                hotelCode: hotelCode,
                invTypeCode: invTypeCode,
                "availability.startDate": { $gte: start, $lte: end }
            }).exec();

            return inventory;
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            throw error;
        }
    }

    /**
 * Get rate data separately
 */
    private static async getRateData(
        hotelCode: string,
        invTypeCode: string,
        start: Date,
        end: Date
    ) {
        try {
            const rates = await RateAmount.find({
                hotelCode: hotelCode,
                invTypeCode: invTypeCode,
                startDate: { $gte: start, $lte: end }
            }).exec();

            return rates;
        } catch (error) {
            console.error('Error fetching rate data:', error);
            throw error;
        }
    }

    /**
     * Combine inventory with rates based on date matching
     */
    private static combineInventoryWithRates(
        inventoryData: any[],
        rateData: any[],
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number
    ) {
        return inventoryData.map(inventory => {
            const matchingRate = rateData.find(rate =>
                rate.hotelCode === inventory.hotelCode &&
                rate.invTypeCode === inventory.invTypeCode &&
                rate.startDate >= inventory.availability.startDate &&
                rate.startDate <= inventory.availability.endDate
            );

            const result: any = {
                hotelCode: inventory.hotelCode,
                hotelName: inventory.hotelName,
                invTypeCode: inventory.invTypeCode,
                inventory: {
                    availability: {
                        startDate: inventory.availability.startDate,
                        endDate: inventory.availability.endDate,
                        count: inventory.availability.count
                    }
                },
                rate: null,
                pricing: null,
                roomAcceptance: {
                    isAccepted: false,
                    message: ''
                }
            };

            // Add rate data and calculate pricing if found
            if (matchingRate) {
                const totalGuests = noOfAdults + noOfChildren;
                const pricingDetails = this.calculatePricing(
                    matchingRate,
                    noOfAdults,
                    noOfChildren,
                    noOfRooms
                );

                const roomAcceptance = this.checkRoomAcceptance(
                    inventory,
                    matchingRate,
                    noOfAdults,
                    noOfChildren,
                    noOfRooms
                );

                result.rate = {
                    ratePlanCode: matchingRate.ratePlanCode,
                    startDate: matchingRate.startDate,
                    endDate: matchingRate.endDate,
                    days: matchingRate.days,
                    currencyCode: matchingRate.currencyCode,
                    baseByGuestAmts: matchingRate.baseByGuestAmts,
                    additionalGuestAmounts: matchingRate.additionalGuestAmounts,
                    dateMatch: true
                };

                result.pricing = pricingDetails;
                result.roomAcceptance = roomAcceptance;
            }

            return result;
        });
    }

    /**
 * Calculate pricing based on number of guests and rate plan
 */
    private static calculatePricing(
        rate: any,
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number
    ) {
        const totalGuests = noOfAdults + noOfChildren;

        // Find the base price for the number of guests
        const baseGuestAmounts = rate.baseByGuestAmts || [];

        // Sort by numberOfGuests to find the appropriate base rate
        const sortedBaseRates = baseGuestAmounts.sort((a: any, b: any) =>
            a.numberOfGuests - b.numberOfGuests
        );

        // Find the base rate that covers the number of guests
        let baseRate = null;
        for (const baseAmount of sortedBaseRates) {
            if (baseAmount.numberOfGuests >= totalGuests) {
                baseRate = baseAmount.amountBeforeTax;
                break;
            }
        }

        // If no base rate found for the number of guests, use the highest available
        if (!baseRate && sortedBaseRates.length > 0) {
            baseRate = sortedBaseRates[sortedBaseRates.length - 1].amountBeforeTax;
        }

        // Calculate additional guest charges
        let additionalCharges = 0;
        const additionalGuestAmounts = rate.additionalGuestAmounts || [];

        if (baseRate && sortedBaseRates.length > 0) {
            const maxBaseGuests = Math.max(...sortedBaseRates.map((b: any) => b.numberOfGuests));

            if (totalGuests > maxBaseGuests) {
                const extraGuests = totalGuests - maxBaseGuests;

                // Use the first additional guest amount as default for extra guests
                if (additionalGuestAmounts.length > 0) {
                    const defaultAdditionalRate = additionalGuestAmounts[0].amount;
                    additionalCharges = extraGuests * defaultAdditionalRate;
                }
            }
        }

        const basePrice = baseRate || 0;
        const totalPrice = (basePrice + additionalCharges) * noOfRooms;

        return {
            basePrice: basePrice,
            additionalCharges: additionalCharges,
            totalPrice: totalPrice,
            pricePerRoom: basePrice + additionalCharges,
            currencyCode: rate.currencyCode,
            breakdown: {
                baseGuestsCovered: sortedBaseRates.length > 0 ?
                    Math.max(...sortedBaseRates.map((b: any) => b.numberOfGuests)) : 0,
                totalGuests: totalGuests,
                extraGuests: baseRate ?
                    Math.max(0, totalGuests - Math.max(...sortedBaseRates.map((b: any) => b.numberOfGuests))) : totalGuests,
                additionalGuestRate: additionalGuestAmounts.length > 0 ? additionalGuestAmounts[0].amount : 0
            }
        };
    }

    /**
     * Check if the room can accept the requested number of guests
     */
    private static checkRoomAcceptance(
        inventory: any,
        rate: any,
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number
    ) {
        const totalGuests = noOfAdults + noOfChildren;
        const baseGuestAmounts = rate.baseByGuestAmts || [];

        // Get maximum guests supported by base rates
        const maxBaseGuests = baseGuestAmounts.length > 0 ?
            Math.max(...baseGuestAmounts.map((b: any) => b.numberOfGuests)) : 0;

        // Check inventory availability
        const availableRooms = inventory.availability?.count || 0;
        const hasEnoughRooms = availableRooms >= noOfRooms;

        // Check if guests exceed base capacity
        const exceedsBaseCapacity = totalGuests > maxBaseGuests;

        // Check if we have additional guest rates for extra guests
        const additionalGuestAmounts = rate.additionalGuestAmounts || [];
        const hasAdditionalRates = additionalGuestAmounts.length > 0;

        let isAccepted = true;
        let message = 'Room accepted';

        if (!hasEnoughRooms) {
            isAccepted = false;
            message = `Not enough rooms available. Requested: ${noOfRooms}, Available: ${availableRooms}`;
        } else if (exceedsBaseCapacity && !hasAdditionalRates) {
            isAccepted = false;
            message = `Room cannot accommodate ${totalGuests} guests. Maximum base guests: ${maxBaseGuests}, and no additional guest rates available.`;
        } else if (exceedsBaseCapacity) {
            message = `Room accommodates ${totalGuests} guests with additional charges. Base capacity: ${maxBaseGuests}`;
        }

        return {
            isAccepted,
            message,
            details: {
                availableRooms,
                requestedRooms: noOfRooms,
                maxBaseGuests,
                totalRequestedGuests: totalGuests,
                exceedsBaseCapacity,
                hasAdditionalRates
            }
        };
    }


    // *****************************************

    public static async checkAvailabilityDao(hotelCode: string, invTypeCode: string, startDate: Date, endDate: Date) {
        try {
            const availability = await Inventory.findOne({ hotelCode: hotelCode, invTypeCode: invTypeCode, startDate: startDate, endDate: endDate })
            return availability
        } catch (error) {
            console.log("Error occur while checking availability");
            throw error;
        }
    }
}
export { HotelPricesDao }