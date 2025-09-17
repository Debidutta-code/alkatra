import { Types } from "mongoose";
import AnalyticsDAO from "../dao/analytics.dao";
import UserModel from "../../../user_authentication/src/Model/auth.model";
import { PropertyInfo } from "../../../property_management/src/model/property.info.model";

export default class AnalyticsController {
    public static async getAnalytics(req: any) {
        try {
            const { startDate, endDate, year, hotelName } = req.query;
            const role = req.role;
            const userEmail = req.user.email;
            const userId = req.user.id;

            const parsedStartDate = startDate ? new Date(startDate) : undefined;
            const parsedEndDate = endDate ? new Date(endDate) : undefined;

            

            const parsedYear = year && !isNaN(Number(year)) ? parseInt(year) : undefined;
            let hotelCodes: string[] | undefined = [];

            switch (role) {
                case "superAdmin":
                    hotelCodes = undefined; // Allow access to all properties
                    if (hotelName) {
                        try {
                            const property = await PropertyInfo.findOne({
                                property_name: { $regex: new RegExp(hotelName, 'i') }
                            }).select("property_code");

                            if (property) {
                                hotelCodes = property.property_code ? [property.property_code] : [];
                            } else {
                                hotelCodes = [];
                            }
                        } catch (searchError) {
                            hotelCodes = [];
                        }
                    }
                    break;

                case "groupManager":
                    try {
                        const hotelManagers = await UserModel.find({
                            createdBy: userEmail,
                            role: "hotelManager",
                        }).select("_id");

                        if (hotelManagers.length > 0) {
                            const hotelManagerIds = hotelManagers.map((manager) => manager._id);
                            const properties = await PropertyInfo.find({
                                user_id: { $in: hotelManagerIds }
                            }).select("property_code property_name user_id isDraft");

                            hotelCodes = properties
                                .map((property) => property.property_code)
                                .filter((code): code is string => Boolean(code));
                        } else {
                            hotelCodes = [];
                        }
                    } catch (groupManagerError) {
                        hotelCodes = [];
                    }
                    break;

                case "hotelManager":
                    try {
                        const userProperties = await PropertyInfo.find({
                            user_id: new Types.ObjectId(userId)
                        }).select("property_code property_name user_id isDraft");

                        if (userProperties.length > 0) {
                            hotelCodes = userProperties
                                .map(property => property.property_code)
                                .filter((code): code is string => Boolean(code));
                        } else {
                            hotelCodes = [];
                        }
                    } catch (hotelManagerError) {
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

            const [
                reservationStats,
                reservationsByStatus,
                monthlyTrends,
                topHotels,
                customerAnalytics,
                revenueByPaymentMethod,
                cancellationAnalytics,
                occupancyAnalytics,
            ] = await Promise.all([
                AnalyticsDAO.getReservationStats(
                    parsedStartDate,
                    parsedEndDate,
                    hotelCodes
                ),
                AnalyticsDAO.getReservationsByStatus(parsedStartDate, parsedEndDate, hotelCodes),
                AnalyticsDAO.getMonthlyReservationTrends(parsedStartDate, parsedEndDate, hotelCodes, parsedYear),
                AnalyticsDAO.getTopHotels(parsedStartDate, parsedEndDate, hotelCodes),
                AnalyticsDAO.getCustomerAnalytics(parsedStartDate, parsedEndDate, hotelCodes),
                AnalyticsDAO.getRevenueByPaymentMethod(parsedStartDate, parsedEndDate, hotelCodes),
                AnalyticsDAO.getCancellationAnalytics(parsedStartDate, parsedEndDate, hotelCodes),
                AnalyticsDAO.getOccupancyAnalytics(
                    parsedStartDate,
                    parsedEndDate,
                    hotelCodes
                ),
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
        } catch (error) {
            console.error("Error in getAnalytics:", error);
            return {
                success: false,
                message: "An error occurred while fetching analytics.",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    }
}