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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomPrice = exports.RatePlanController = void 0;
const ratePlan_service_1 = require("../service/ratePlan.service");
class RatePlanController {
    static createRatePlan(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { propertyId, ratePlanName, ratePlanCode, description, type, weeklyDays, dateRanges, availableSpecificDates, mealPlan, minLengthStay, maxLengthStay, minReleaseDay, maxReleaseDay, cancellationDeadline, currency, status, createdBy, updatedBy, } = req.body;
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
                const response = yield ratePlan_service_1.RatePlanService.createRatePlan(ratePlanData);
                return response;
            }
            catch (error) {
                console;
                next(error);
            }
        });
    }
    static updateRatePlan(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Update Rate");
                const inventoryId = req.params.id;
                const ratePlanData = req.body;
                const ratePlans = req.body.ratePlans;
                const response = yield ratePlan_service_1.RatePlanService.updateRatePlan(ratePlans);
                return response;
                return { success: false };
            }
            catch (error) {
                console.error("Error in updateRatePlan:", error);
                next(error);
            }
        });
    }
    static getRatePlanByHotelCode(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hotelCode } = req.params;
                const response = yield ratePlan_service_1.RatePlanService.getRatePlanByHotelCode(hotelCode);
                return response;
            }
            catch (error) {
                console.error("Error in getRatePlanByHotelCode controller:", error);
                next(error);
            }
        });
    }
    static getRatePlanByHotel(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { hotelCode, invTypeCode, startDate, endDate } = req.body;
                console.log(hotelCode, invTypeCode, startDate, endDate);
                const page = (_a = req.query) === null || _a === void 0 ? void 0 : _a.page.toString();
                const response = yield ratePlan_service_1.RatePlanService.getRatePlanByHotel(hotelCode, invTypeCode && invTypeCode, startDate && new Date(startDate), endDate && new Date(endDate), page && parseInt(page));
                return response;
            }
            catch (error) {
                console.error("Error in getRatePlanByHotelCode controller:", error);
                next(error);
            }
        });
    }
}
exports.RatePlanController = RatePlanController;
class RoomPrice {
    static getRoomPriceByHotelCode(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotelcode, invTypeCode } = req.query;
            const response = yield ratePlan_service_1.RoomPriceService.getRoomPriceService(hotelcode, invTypeCode);
            return response;
        });
    }
    static getRoomRentController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotelCode, invTypeCode, startDate, endDate, noOfChildrens, noOfAdults, noOfRooms } = req.body;
            const response = yield ratePlan_service_1.RoomRentCalculationService.getRoomRentService(hotelCode, invTypeCode, startDate, endDate, noOfChildrens, noOfAdults, noOfRooms);
            if (response.success === false) {
                console.error("Error in getRoomRentController:", response.message);
                return;
            }
            console.log(`The response we get from Get-Room-Rent-Controller${JSON.stringify(response)}`);
            return response;
        });
    }
    static getAllRoomTypeController() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield ratePlan_service_1.RoomPriceService.getAllRoomTypeService();
            console.log(response);
            return response;
        });
    }
    static checkAvailabilityController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hotelcode, invTypeCode, startDate, endDate, noOfRooms } = req.body;
                const response = yield ratePlan_service_1.RoomPriceService.checkAvailabilityService(hotelcode, invTypeCode, startDate, endDate, noOfRooms);
                return response;
            }
            catch (error) {
                return {
                    success: false,
                    message: "Error occur while checking availability for this hotel",
                    error: error.message
                };
            }
        });
    }
}
exports.RoomPrice = RoomPrice;
//# sourceMappingURL=ratePlan.controller.js.map