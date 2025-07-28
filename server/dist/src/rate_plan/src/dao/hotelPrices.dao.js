"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelPricesDao = void 0;
const ratePlanDateWise_model_1 = __importDefault(require("../../../wincloud/src/model/ratePlanDateWise.model"));
const inventoryModel_1 = require("../../../wincloud/src/model/inventoryModel");
class HotelPricesDao {
    static getHotelPlans(hotelCode, invTypeCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield ratePlanDateWise_model_1.default.find({ hotelCode: hotelCode, invTypeCode: invTypeCode }).select("baseByGuestAmts currencyCode");
            return result;
        });
    }
    static getInventory(hotelCode, invTypeCode, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield inventoryModel_1.Inventory.find({
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
            });
        });
    }
    static getRateAmount(hotelCode, invTypeCode, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ratePlanDateWise_model_1.default.find({
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
            });
        });
    }
    static getInventoryWithRates(hotelCode, invTypeCode, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("The data get from ratePlanService CONTROLLER", hotelCode, invTypeCode, start, end);
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
                const results = yield inventoryModel_1.Inventory.aggregate(pipeline).exec();
                results.map((item) => {
                    console.log(item);
                    console.log(item.rate);
                });
                console.log("The data get from ratePlanService DAO", results);
                return results;
            }
            catch (error) {
                console.error('Error in aggregation pipeline:', error);
                throw error;
            }
        });
    }
    static checkAvailabilityDao(hotelCode, invTypeCode, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const availability = yield inventoryModel_1.Inventory.findOne({ hotelCode: hotelCode, invTypeCode: invTypeCode, startDate: startDate, endDate: endDate });
                return availability;
            }
            catch (error) {
                console.log("Error occur while checking availability");
                throw error;
            }
        });
    }
}
exports.HotelPricesDao = HotelPricesDao;
//# sourceMappingURL=hotelPrices.dao.js.map