import RateAmount from "../../../wincloud/src/model/ratePlanDateWise.model";
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { Inventory } from "../../../wincloud/src/model/inventoryModel";

/**
 * Interfaces
 */
interface IInventory {
    _id: string;
    hotelCode: string;
    hotelName?: string;
    invTypeCode: string;
    ratePlanCode: string;
    availability: { startDate: Date; endDate: Date; count: number };
    status: string;
}

interface IRatePlan {
    _id: string;
    hotelCode: string;
    invTypeCode: string;
    ratePlanCode: string;
    startDate: Date;
    endDate: Date;
    currencyCode: string;
    baseByGuestAmts: { amountBeforeTax: number; numberOfGuests: number }[];
    additionalGuestAmounts: { ageQualifyingCode: string; amount: number }[];
}

interface RoomWithRates {
    _id: string;
    hotelCode: string;
    hotelName: string;
    invTypeCode: string;
    availability: { startDate: Date; endDate: Date; count: number };
    rates: {
        _id: string;
        currencyCode: string;
        ratePlanCode: string;
        startDate: Date;
        endDate: Date;
        baseByGuestAmts: { amountBeforeTax: number; numberOfGuests: number } | null;
    } | null;
}


export class BookAgainRepository {

    private static instance: BookAgainRepository;

    private constructor() { }

    static getInstance(): BookAgainRepository {
        if (!BookAgainRepository.instance) {
            BookAgainRepository.instance = new BookAgainRepository();
        }
        return BookAgainRepository.instance;
    }

    /**
    * Get available rooms with their corresponding rates using aggregation pipeline
    * @hotelCode
    * @invTypeCode
    * @ratePlanCode
    * @page
    * @limit
    */
    public static async getRatePlanByHotel(
        hotelCode: string,
        invTypeCode?: string,
        startDate?: string,
        endDate?: string,
        page: number = 1,
        limit: number = 10
    ) {
        try {

            const resultsPerPage = limit;
            const skip = (page - 1) * resultsPerPage;

            const [inventory, ratePlans] = await Promise.all([
                this.getInventoryOfHotel(hotelCode, invTypeCode, startDate, endDate),
                this.getRoomRateOfHotel(hotelCode, invTypeCode, startDate, endDate),
            ]);

            const mappedData = this.mapInventoryToRatePlans(inventory, ratePlans);
            if (!mappedData) {
                throw new Error("No mapped data found");
            }

            const totalResults = mappedData.length;
            const paginatedData = mappedData.slice(skip, skip + resultsPerPage);
            const totalPages = Math.ceil(totalResults / resultsPerPage);

            const result = {
                data: paginatedData,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    resultsPerPage,
                },
            };


            return result;
        } catch (error: any) {
            throw new Error(`Failed to fetch rate plans: ${error.message}`);
        }
    }

    /**
     * Helper: Get inventory by hotel
     */
    private static async getInventoryOfHotel(
        hotelCode: string,
        invTypeCode?: string,
        startDate?: string,
        endDate?: string
    ) {
        try {

            const inventoryMatch: any = { hotelCode };
            if (invTypeCode) {
                inventoryMatch.invTypeCode = invTypeCode;
            }

            if (startDate) {
                inventoryMatch["availability.startDate"] = { $gte: startOfDay(startDate) };
            }

            if (endDate) {
                inventoryMatch["availability.endDate"] = { $lte: endOfDay(endDate) };
            }

            // inventoryMatch["availability.startDate"] = { $gte: startOfDay(new Date()) };
            console.log("the inventory match is", inventoryMatch);
            const inventory = await Inventory.aggregate([
                { $match: inventoryMatch },
            ]);

            return inventory;
        } catch (error: any) {
            console.log(`Failed to fetch inventory: ${error.message}`);
            throw new Error(`Failed to fetch inventory`);
        }
    }

    /**
     * Helper: Get rateplan by hotel
     */

    private static async getRoomRateOfHotel(
        hotelCode: string,
        invTypeCode?: string,
        startDate?: string,
        endDate?: string
    ) {
        try {
            console.log("THe hotel code is", hotelCode);
            const ratePlanMatch: any = { hotelCode };

            if (invTypeCode) {
                ratePlanMatch.invTypeCode = invTypeCode;
            }

            if (startDate) {
                ratePlanMatch.startDate = { $gte: startOfDay(startDate) };
            }

            if (endDate) {
                ratePlanMatch.endDate = { $lte: endOfDay(endDate) };
            }
            // else {
            //   const tomorrow = new Date();
            //   tomorrow.setDate(tomorrow.getDate() + 1);
            //   ratePlanMatch.endDate = { $gte: startOfDay(tomorrow) };
            // }

            // ratePlanMatch.startDate = { $gte: startOfDay(new Date()) };
            console.log("the rate plan match is", ratePlanMatch);
            const ratePlan = await RateAmount.aggregate([
                { $match: ratePlanMatch },
            ]);

            console.log("The rate plan we get from DB is ", ratePlan);

            return ratePlan;


        } catch (error: any) {
            console.log(`Failed to fetch rateplan: ${error.message}`);
            throw new Error(`Failed to fetch rateplan`);
        }
    }

    /**
     * Helper: Map inventory and rate plan
     */
    private static mapInventoryToRatePlans(
        inventory: IInventory[],
        ratePlans: IRatePlan[]
    ): RoomWithRates[] {

        const results: RoomWithRates[] = [];

        inventory.forEach((inv) => {

            if (inv.status === 'close') {
                throw new Error(`Inventory ${inv._id} is closed`);
            }

            const matchingRates = ratePlans.filter(
                (rate) =>
                    rate.hotelCode === inv.hotelCode
                    && rate.invTypeCode === inv.invTypeCode
                    && rate.startDate.getTime() === inv.availability.startDate.getTime()
                // && rate.endDate.getTime() >= inv.availability.endDate.getTime()
            );

            matchingRates.forEach((matchingRate) => {

                const result: RoomWithRates = {
                    _id: inv._id,
                    hotelCode: inv.hotelCode,
                    hotelName: inv.hotelName!,
                    invTypeCode: inv.invTypeCode,
                    availability: inv.availability,
                    rates: {
                        _id: matchingRate._id,
                        currencyCode: matchingRate.currencyCode,
                        ratePlanCode: matchingRate.ratePlanCode,
                        startDate: matchingRate.startDate,
                        endDate: matchingRate.endDate,
                        baseByGuestAmts:
                            matchingRate.baseByGuestAmts.length > 0
                                ? matchingRate.baseByGuestAmts[0]
                                : null,
                    },
                };

                results.push(result);
            });
        });
        return results;
    }
}