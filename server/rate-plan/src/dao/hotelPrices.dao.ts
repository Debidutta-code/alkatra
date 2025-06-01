import { RateAmount } from "../../../wincloud/src/model/ratePlanModel"
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
        const pipeline = [
            // Stage 1: Match inventory records
            {
                $match: {
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
                }
            },

            // Stage 2: Lookup rates from RateAmount collection
            {
                $lookup: {
                    from: 'rateamounts', // MongoDB collection name (lowercase + plural)
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
                                        {
                                            $or: [
                                                {
                                                    $and: [
                                                        { $lte: ['$startDate', end] },
                                                        { $gte: ['$endDate', start] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $addFields: {
                                dateMatch: {
                                    $and: [
                                        {
                                            $or: [
                                                { $lte: ['$startDate', '$$invEndDate'] },
                                                { $gte: ['$endDate', '$$invStartDate'] }
                                            ]
                                        },
                                        {
                                            $or: [
                                                { $gte: ['$startDate', '$$invStartDate'] },
                                                { $lte: ['$endDate', '$$invEndDate'] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'rates'
                }
            },

            // Stage 3: Project the final structure
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
                    rates: {
                        $map: {
                            input: '$rates',
                            as: 'rate',
                            in: {
                                ratePlanCode: '$$rate.ratePlanCode',
                                startDate: '$$rate.startDate',
                                endDate: '$$rate.endDate',
                                days: '$$rate.days',
                                currencyCode: '$$rate.currencyCode',
                                baseByGuestAmts: '$$rate.baseByGuestAmts',
                                additionalGuestAmounts: '$$rate.additionalGuestAmounts',
                                dateMatch: '$$rate.dateMatch'
                            }
                        }
                    }
                }
            }
        ];
        try {
            const results = await Inventory.aggregate(pipeline).exec();
            return results
        } catch (error) {
            console.error('Error in aggregation pipeline:', error);
            throw error;
        }
    }
}
export { HotelPricesDao }