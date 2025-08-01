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
const mongoose_1 = require("mongoose");
const analytics_dao_1 = __importDefault(require("../dao/analytics.dao"));
const auth_model_1 = __importDefault(require("../../../user_authentication/src/Model/auth.model"));
const property_info_model_1 = require("../../../property_management/src/model/property.info.model");
class AnalyticsController {
    static getAnalytics(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, year, hotelName } = req.query;
                const role = req.role;
                const userEmail = req.user.email;
                const userId = req.user.id;
                console.log("Role:", role, "User Email:", userEmail, "User ID:", userId, "Hotel Name:", hotelName, "Start Date:", startDate, "End Date:", endDate, "Year:", year);
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                console.log("Parsed Start Date:", parsedStartDate, "Parsed End Date:", parsedEndDate);
                const parsedYear = year && !isNaN(Number(year)) ? parseInt(year) : undefined;
                let hotelCodes = [];
                switch (role) {
                    case "superAdmin":
                        hotelCodes = undefined; // Allow access to all properties
                        if (hotelName) {
                            try {
                                const property = yield property_info_model_1.PropertyInfo.findOne({
                                    property_name: { $regex: new RegExp(hotelName, 'i') }
                                }).select("property_code");
                                if (property) {
                                    hotelCodes = property.property_code ? [property.property_code] : [];
                                }
                                else {
                                    hotelCodes = [];
                                }
                            }
                            catch (searchError) {
                                hotelCodes = [];
                            }
                        }
                        break;
                    case "groupManager":
                        try {
                            const hotelManagers = yield auth_model_1.default.find({
                                createdBy: userEmail,
                                role: "hotelManager",
                            }).select("_id");
                            if (hotelManagers.length > 0) {
                                const hotelManagerIds = hotelManagers.map((manager) => manager._id);
                                const properties = yield property_info_model_1.PropertyInfo.find({
                                    user_id: { $in: hotelManagerIds }
                                }).select("property_code property_name user_id isDraft");
                                hotelCodes = properties
                                    .map((property) => property.property_code)
                                    .filter((code) => Boolean(code));
                            }
                            else {
                                hotelCodes = [];
                            }
                        }
                        catch (groupManagerError) {
                            hotelCodes = [];
                        }
                        break;
                    case "hotelManager":
                        try {
                            const userProperties = yield property_info_model_1.PropertyInfo.find({
                                user_id: new mongoose_1.Types.ObjectId(userId)
                            }).select("property_code property_name user_id isDraft");
                            if (userProperties.length > 0) {
                                hotelCodes = userProperties
                                    .map(property => property.property_code)
                                    .filter((code) => Boolean(code));
                            }
                            else {
                                hotelCodes = [];
                            }
                        }
                        catch (hotelManagerError) {
                            hotelCodes = [];
                        }
                        break;
                    default:
                        throw new Error(`Invalid role: ${role}`);
                }
                if (Array.isArray(hotelCodes) && hotelCodes.length === 0) {
                    return {
                        success: true,
                        message: "No properties found for this user.",
                        data: {
                            overview: {
                                totalReservations: 0,
                                totalRevenue: 0,
                                averageReservationValue: 0,
                                confirmedReservations: 0,
                                pendingReservations: 0,
                                cancelledReservations: 0,
                                totalRooms: 0,
                                averageRoomsPerReservation: 0,
                            },
                            reservationsByStatus: [],
                            monthlyTrends: [],
                            topHotels: [],
                            customerAnalytics: {
                                totalCustomers: 0,
                                averageReservationsPerCustomer: 0,
                                averageSpentPerCustomer: 0,
                                averageReservationValue: 0,
                                repeatCustomers: 0,
                                averageRoomsPerCustomer: 0,
                            },
                            revenueByPaymentMethod: [],
                            cancellationAnalytics: {
                                totalCancellations: 0,
                                cancellationRate: 0,
                            },
                            occupancyAnalytics: [],
                        },
                    };
                }
                const [reservationStats, reservationsByStatus, monthlyTrends, topHotels, customerAnalytics, revenueByPaymentMethod, cancellationAnalytics, occupancyAnalytics,] = yield Promise.all([
                    analytics_dao_1.default.getReservationStats(parsedStartDate, parsedEndDate, hotelCodes),
                    analytics_dao_1.default.getReservationsByStatus(parsedStartDate, parsedEndDate, hotelCodes),
                    analytics_dao_1.default.getMonthlyReservationTrends(parsedStartDate, parsedEndDate, hotelCodes, parsedYear),
                    analytics_dao_1.default.getTopHotels(parsedStartDate, parsedEndDate, hotelCodes),
                    analytics_dao_1.default.getCustomerAnalytics(parsedStartDate, parsedEndDate, hotelCodes),
                    analytics_dao_1.default.getRevenueByPaymentMethod(parsedStartDate, parsedEndDate, hotelCodes),
                    analytics_dao_1.default.getCancellationAnalytics(parsedStartDate, parsedEndDate, hotelCodes),
                    analytics_dao_1.default.getOccupancyAnalytics(parsedStartDate, parsedEndDate, hotelCodes),
                ]);
                return {
                    success: true,
                    message: "Analytics fetched successfully.",
                    data: {
                        overview: reservationStats,
                        reservationsByStatus,
                        monthlyTrends,
                        topHotels,
                        customerAnalytics,
                        revenueByPaymentMethod,
                        cancellationAnalytics,
                        occupancyAnalytics,
                    },
                };
            }
            catch (error) {
                console.error("Error in getAnalytics:", error);
                return {
                    success: false,
                    message: "An error occurred while fetching analytics.",
                    error: error instanceof Error ? error.message : "Unknown error occurred",
                };
            }
        });
    }
}
exports.default = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map