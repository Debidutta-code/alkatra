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

    public static async getInventoryWithRates(hotelCode: string, invTypeCode: string, start: Date, end: Date) {
        console.log("The data get from ratePlanService CONTROLLER",hotelCode, invTypeCode, start, end)
        const pipeline = [
            // Stage 1: Match inventory records - ONLY by startDate
            {
                $match: {
                    hotelCode: hotelCode,
                    invTypeCode: invTypeCode,
                    "availability.startDate": { $gte: start, $lte: end }
                }
            },
            // Stage 2: Lookup rates from RateAmount collection
            {
                $lookup: {
                    from: 'rateamountdatewises',
                    let: {
                        hotelCode: '$hotelCode',
                        invTypeCode: '$invTypeCode',
                        invStartDate: '$availability.startDate',
                        invEndDate: '$availability.endDate'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$hotelCode', '$$hotelCode'] },
                                        { $eq: ['$invTypeCode', '$$invTypeCode'] },
                                        // Only match rates that start within the inventory period
                                        { $gte: ['$startDate', '$$invStartDate'] },
                                        { $lte: ['$startDate', '$$invEndDate'] }
                                    ]
                                }
                            }
                        },
                        {
                            $addFields: {
                                dateMatch: {
                                    $and: [
                                        { $gte: ['$startDate', '$$invStartDate'] },
                                        { $lte: ['$startDate', '$$invEndDate'] }
                                    ]
                                }
                            }
                        },
                        // Limit to 1 since you expect only one rate per day
                        {
                            $limit: 1
                        }
                    ],
                    as: 'rates'
                }
            },
            // Stage 3: Project the final structure with rate as object instead of array
            {
                $project: {
                    hotelCode: 1,
                    hotelName: 1,
                    invTypeCode: 1,
                    inventory: {
                        availability: {
                            startDate: '$availability.startDate',
                            endDate: '$availability.endDate',
                            count: '$availability.count'
                        }
                    },
                    rate: {
                        $cond: {
                            if: { $gt: [{ $size: '$rates' }, 0] },
                            then: {
                                ratePlanCode: { $arrayElemAt: ['$rates.ratePlanCode', 0] },
                                startDate: { $arrayElemAt: ['$rates.startDate', 0] },
                                endDate: { $arrayElemAt: ['$rates.endDate', 0] },
                                days: { $arrayElemAt: ['$rates.days', 0] },
                                currencyCode: { $arrayElemAt: ['$rates.currencyCode', 0] },
                                baseByGuestAmts: { $arrayElemAt: ['$rates.baseByGuestAmts', 0] },
                                additionalGuestAmounts: { $arrayElemAt: ['$rates.additionalGuestAmounts', 0] },
                                dateMatch: { $arrayElemAt: ['$rates.dateMatch', 0] }
                            },
                            else: null
                        }
                    }
                }
            }
        ];

        try {
            console.log(`The pipeline is ${JSON.stringify(pipeline)}`);
            const results = await Inventory.aggregate(pipeline).exec();
            results.map((item) => {
                console.log(item)
                console.log(item.rate) 
            })
            console.log("The data get from ratePlanService DAO", results)
            return results
        } catch (error) {
            console.error('Error in aggregation pipeline:', error);
            throw error;
        }
    }

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