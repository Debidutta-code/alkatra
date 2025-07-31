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
exports.RatePlanDao = void 0;
const ratePlan_model_1 = __importDefault(require("../model/ratePlan.model"));
const ratePlanDateWise_model_1 = __importDefault(require("../../../wincloud/src/model/ratePlanDateWise.model"));
const inventoryModel_1 = require("../../../wincloud/src/model/inventoryModel");
const date_fns_1 = require("date-fns");
class RatePlanDao {
    static create(ratePlanData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ratePlan = new ratePlan_model_1.default(ratePlanData);
                return yield ratePlan.save();
            }
            catch (error) {
                console.error("Error creating rate plan:", error);
                throw new Error("Failed to create rate plan");
            }
        });
    }
    static updateRatePlan(ratePlansData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate input
                if (!Array.isArray(ratePlansData) || ratePlansData.length === 0) {
                    throw new Error("ratePlansData must be a non-empty array");
                }
                // Create update promises for each rate plan
                const updatePromises = ratePlansData.map((planData, index) => __awaiter(this, void 0, void 0, function* () {
                    const { rateAmountId, price } = planData;
                    let inventoryUpdated = null;
                    let rateUpdated = null;
                    if (price !== undefined && rateAmountId) {
                        console.log("rate amount", rateAmountId);
                        rateUpdated = yield ratePlanDateWise_model_1.default.findByIdAndUpdate(rateAmountId, {
                            $set: {
                                "baseByGuestAmts.$[].amountBeforeTax": price
                            }
                        }, { new: true, runValidators: true });
                        if (!rateUpdated) {
                            throw new Error(`Rate Amount update failed for rateAmountId: ${rateAmountId}`);
                        }
                    }
                    if (price === undefined) {
                        throw new Error(`No update data provided for index ${index}`);
                    }
                    return {
                        index,
                        rateAmountId,
                        rateAmount: rateUpdated,
                        inventory: inventoryUpdated,
                        success: true
                    };
                }));
                // Wait for all updates to complete (parallel execution)
                const results = yield Promise.allSettled(updatePromises);
                const successResults = [];
                const errorResults = [];
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        successResults.push(result.value);
                    }
                    else {
                        errorResults.push({
                            index,
                            rateAmountId: ratePlansData[index].rateAmountId,
                            inventoryId: ratePlansData[index].inventoryId,
                            error: result.reason.message,
                            success: false
                        });
                    }
                });
                const response = {
                    totalProcessed: ratePlansData.length,
                    successCount: successResults.length,
                    errorCount: errorResults.length,
                    results: successResults,
                    errors: errorResults,
                    message: `Processed ${ratePlansData.length} rate plans: ${successResults.length} successful, ${errorResults.length} failed`
                };
                // If all updates failed, throw an error
                if (errorResults.length === ratePlansData.length) {
                    throw new Error(`All rate plan updates failed: ${errorResults.map(e => e.error).join('; ')}`);
                }
                return response;
            }
            catch (error) {
                console.error("Error updating rate plans:", error);
                throw error;
            }
        });
    }
    /**
    * Get available rooms with their corresponding rates using aggregation pipeline
    */
    static getRatePlanByHotel(hotelCode, invTypeCode, startDate, endDate, page) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            page = page !== null && page !== void 0 ? page : 1;
            const resultsPerPage = 10;
            const skip = (page - 1) * resultsPerPage;
            // Build match stage for inventory based on given parameters
            const inventoryMatch = { hotelCode };
            if (invTypeCode) {
                inventoryMatch.invTypeCode = invTypeCode;
            }
            if (startDate && endDate) {
                const start = (0, date_fns_1.startOfDay)(startDate);
                const end = (0, date_fns_1.endOfDay)(endDate);
                inventoryMatch.$or = [
                    { "availability.startDate": { $gte: start, $lte: end } },
                    { "availability.endDate": { $gte: start, $lte: end } },
                    {
                        $and: [
                            { "availability.startDate": { $lte: start } },
                            { "availability.endDate": { $gte: end } }
                        ]
                    }
                ];
            }
            // UPDATED RATE LOOKUP PIPELINE
            // Simplified to match exact start dates
            const rateLookupPipeline = [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$hotelCode", "$$hotelCode"] },
                                { $eq: ["$invTypeCode", "$$invTypeCode"] },
                                // Match exact start date instead of range overlap
                                { $eq: ["$startDate", "$$inventoryStartDate"] }
                            ]
                        }
                    }
                }
            ];
            // Pipeline for counting total results
            const countPipeline = [
                { $match: inventoryMatch },
                {
                    $lookup: {
                        from: "rateamountdatewises",
                        let: {
                            hotelCode: "$hotelCode",
                            invTypeCode: "$invTypeCode",
                            inventoryStartDate: "$availability.startDate"
                        },
                        pipeline: rateLookupPipeline,
                        as: "rates"
                    }
                },
                { $count: "total" }
            ];
            const dataPipeline = [
                { $match: inventoryMatch },
                {
                    $lookup: {
                        from: "rateamountdatewises",
                        let: {
                            hotelCode: "$hotelCode",
                            invTypeCode: "$invTypeCode",
                            inventoryStartDate: "$availability.startDate"
                        },
                        pipeline: rateLookupPipeline,
                        as: "rates"
                    }
                },
                { $skip: skip },
                { $limit: resultsPerPage },
                {
                    $project: {
                        _id: 1,
                        hotelCode: 1,
                        hotelName: 1,
                        invTypeCode: 1,
                        availability: 1,
                        // CHANGED: Convert rates array to single object
                        rates: {
                            $cond: {
                                if: { $gt: [{ $size: "$rates" }, 0] },
                                then: {
                                    $let: {
                                        vars: { firstRate: { $arrayElemAt: ["$rates", 0] } },
                                        in: {
                                            _id: "$$firstRate._id",
                                            currencyCode: "$$firstRate.currencyCode",
                                            ratePlanCode: "$$firstRate.ratePlanCode",
                                            baseByGuestAmts: {
                                                $cond: {
                                                    if: { $gt: [{ $size: "$$firstRate.baseByGuestAmts" }, 0] },
                                                    then: { $arrayElemAt: ["$$firstRate.baseByGuestAmts", 0] },
                                                    else: null
                                                }
                                            },
                                        }
                                    }
                                },
                                else: null
                            }
                        }
                    }
                }
            ];
            // ... rest of the code remains the same ...
            const [countResult, dataResult] = yield Promise.all([
                inventoryModel_1.Inventory.aggregate(countPipeline),
                inventoryModel_1.Inventory.aggregate(dataPipeline)
            ]);
            const totalResults = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            const totalPages = Math.ceil(totalResults / resultsPerPage);
            return {
                data: dataResult,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    resultsPerPage
                }
            };
        });
    }
    static getAllRoomType() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield inventoryModel_1.Inventory.distinct("invTypeCode");
                return response;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    static getRatePlanByHotelCode(hotelCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ratePlan_model_1.default.find({ propertyId: hotelCode });
        });
    }
}
exports.RatePlanDao = RatePlanDao;
//# sourceMappingURL=ratePlan.dao.js.map