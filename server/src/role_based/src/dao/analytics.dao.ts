import { ThirdPartyBooking } from "../../../wincloud/src/model/reservationModel";

export default class AnalyticsDAO {

    private static buildMatchCondition(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        const matchCondition: any = {};

        if (startDate || endDate) {
            matchCondition.createdAt = {};

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                matchCondition.createdAt.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchCondition.createdAt.$lte = end;
            }
        }

        matchCondition.status = { $in: ['Confirmed', 'Pending', 'Cancelled'] };

        if (hotelCodes && hotelCodes.length > 0) {
            matchCondition.hotelCode = { $in: hotelCodes };
        }

        return matchCondition;
    }

    public static async getReservationStats(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const stats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: null,
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        confirmedReservations: {
                            $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] },
                        },
                        pendingReservations: {
                            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                        },
                        cancelledReservations: {
                            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                        averageRoomsPerReservation: { $avg: "$numberOfRooms" },
                    },
                },
                // Add projection to remove _id field
                {
                    $project: {
                        _id: 0, // Remove _id field
                        totalReservations: 1,
                        totalRevenue: 1,
                        averageReservationValue: 1,
                        confirmedReservations: 1,
                        pendingReservations: 1,
                        cancelledReservations: 1,
                        totalRooms: 1,
                        averageRoomsPerReservation: 1,
                    },
                },
            ]);

            return (
                stats[0] || {
                    totalReservations: 0,
                    totalRevenue: 0,
                    averageReservationValue: 0,
                    confirmedReservations: 0,
                    pendingReservations: 0,
                    cancelledReservations: 0,
                    totalRooms: 0,
                    averageRoomsPerReservation: 0,
                }
            );
        } catch (error) {
            throw new Error(`Error fetching reservation stats: ${error.message}`);
        }
    }

    public static async getReservationsByStatus(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const statusStats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                // Add projection to rename _id to status
                {
                    $project: {
                        _id: 0, // Remove original _id
                        status: "$_id", // Rename _id to status
                        count: 1,
                        totalRevenue: 1,
                        totalRooms: 1,
                    },
                },
                {
                    $sort: { count: -1 },
                },
            ]);

            console.log("statusStats", statusStats);
            return statusStats;
        } catch (error) {
            throw new Error(`Error fetching reservations by status: ${error.message}`);
        }
    }

    public static async getMonthlyReservationTrends(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[],
        year?: number
    ) {
        try {
            let matchCondition: any = {};

            if (startDate || endDate) {
                matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);
            } else {
                const currentYear = year || new Date().getFullYear();
                const yearStartDate = new Date(currentYear, 0, 1);
                const yearEndDate = new Date(currentYear, 11, 31);
                matchCondition = this.buildMatchCondition(yearStartDate, yearEndDate, hotelCodes);
            }

            const monthlyTrends = await ThirdPartyBooking.aggregate([
                {
                    $match: matchCondition,
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        },
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 },
                },
            ]);

            return monthlyTrends;
        } catch (error) {
            throw new Error(`Error fetching monthly trends: ${error.message}`);
        }
    }

    public static async getTopHotels(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[],
        limit: number = 5
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const topHotels = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$hotelCode",
                        hotelName: { $first: "$hotelName" },
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        hotelCode: "$_id",
                        hotelName: 1,
                        totalReservations: 1,
                        totalRevenue: 1,
                        averageReservationValue: 1,
                        totalRooms: 1,
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
                {
                    $limit: limit,
                },
            ]);

            return topHotels;
        } catch (error) {
            throw new Error(`Error fetching top hotels: ${error.message}`);
        }
    }

    public static async getCustomerAnalytics(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const customerStats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$email",
                        totalReservations: { $sum: 1 },
                        totalSpent: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        confirmedReservations: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: 1,
                                    else: 0
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                        lastReservationDate: { $max: "$createdAt" },
                        userId: { $first: "$userId" },
                        phone: { $first: "$phone" },
                    },
                },
                {
                    $addFields: {
                        averageReservationValue: {
                            $cond: {
                                if: { $gt: ["$confirmedReservations", 0] },
                                then: { $divide: ["$totalSpent", "$confirmedReservations"] },
                                else: 0
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalCustomers: { $sum: 1 },
                        averageReservationsPerCustomer: { $avg: "$totalReservations" },
                        averageSpentPerCustomer: { $avg: "$totalSpent" },
                        averageReservationValue: { $avg: "$averageReservationValue" },
                        repeatCustomers: {
                            $sum: { $cond: [{ $gt: ["$totalReservations", 1] }, 1, 0] },
                        },
                        averageRoomsPerCustomer: { $avg: "$totalRooms" },
                    },
                },
                // Add projection to remove _id field
                {
                    $project: {
                        _id: 0, // Remove _id field
                        totalCustomers: 1,
                        averageReservationsPerCustomer: 1,
                        averageSpentPerCustomer: 1,
                        averageReservationValue: 1,
                        repeatCustomers: 1,
                        averageRoomsPerCustomer: 1,
                    },
                },
            ]);

            return (
                customerStats[0] || {
                    totalCustomers: 0,
                    averageReservationsPerCustomer: 0,
                    averageSpentPerCustomer: 0,
                    averageReservationValue: 0,
                    repeatCustomers: 0,
                    averageRoomsPerCustomer: 0,
                }
            );
        } catch (error) {
            throw new Error(`Error fetching customer analytics: ${error.message}`);
        }
    }

    public static async getRevenueByPaymentMethod(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const paymentMethodStats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$paymentMethod",
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        paymentMethod: "$_id",
                        totalReservations: 1,
                        totalRevenue: 1,
                        averageReservationValue: 1,
                        totalRooms: 1,
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
            ]);

            return paymentMethodStats;
        } catch (error) {
            throw new Error(`Error fetching revenue by payment method: ${error.message}`);
        }
    }

    public static async getReservationsByDateRange(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[],
        selectFields?: string[]
    ): Promise<any[]> {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            let query: any = ThirdPartyBooking.find(matchCondition)
                .sort({ createdAt: -1 });

            if (selectFields && selectFields.length > 0) {
                query = query.select(selectFields.join(' '));
            }

            const reservations = await query;
            return reservations;
        } catch (error) {
            throw new Error(`Error fetching reservations by date range: ${error.message}`);
        }
    }

    public static async getCancellationAnalytics(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const results = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: null,
                        totalReservations: { $sum: 1 },
                        totalCancellations: {
                            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] }
                        },
                        cancelledRevenueLoss: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Cancelled"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalCancellations: 1,
                        totalReservations: 1,
                        cancellationRate: {
                            $cond: {
                                if: { $gt: ["$totalReservations", 0] },
                                then: {
                                    $round: [
                                        { $multiply: [{ $divide: ["$totalCancellations", "$totalReservations"] }, 100] },
                                        2
                                    ]
                                },
                                else: 0
                            }
                        },
                        cancelledRevenueLoss: 1
                    }
                }
            ]);

            return results[0] || {
                totalCancellations: 0,
                totalReservations: 0,
                cancellationRate: 0,
                cancelledRevenueLoss: 0
            };
        } catch (error) {
            throw new Error(`Error fetching cancellation analytics: ${error.message}`);
        }
    }

    public static async getOccupancyAnalytics(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const occupancyStats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$hotelCode",
                        hotelName: { $first: "$hotelName" },
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                        averageStayDuration: {
                            $avg: {
                                $divide: [
                                    { $subtract: ["$checkOutDate", "$checkInDate"] },
                                    1000 * 60 * 60 * 24,
                                ],
                            },
                        },
                    },
                },
                // Add projection to rename _id to hotelCode
                {
                    $project: {
                        _id: 0, // Remove original _id
                        hotelCode: "$_id", // Rename _id to hotelCode
                        hotelName: 1,
                        totalReservations: 1,
                        totalRevenue: 1,
                        totalRooms: 1,
                        averageStayDuration: 1,
                    },
                },
                {
                    $sort: { totalReservations: -1 },
                },
            ]);

            return occupancyStats;
        } catch (error) {
            throw new Error(`Error fetching occupancy analytics: ${error.message}`);
        }
    }

    public static async getDailyReservationTrends(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const dailyTrends = await ThirdPartyBooking.aggregate([
                {
                    $match: matchCondition,
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" },
                        },
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
                },
            ]);

            return dailyTrends;
        } catch (error) {
            throw new Error(`Error fetching daily trends: ${error.message}`);
        }
    }

    public static async getRoomTypeAnalytics(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const roomTypeStats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$roomTypeCode",
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                // Add projection for consistency
                {
                    $project: {
                        _id: 0,
                        roomTypeCode: "$_id",
                        totalReservations: 1,
                        totalRevenue: 1,
                        averageReservationValue: 1,
                        totalRooms: 1,
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
            ]);

            return roomTypeStats;
        } catch (error) {
            throw new Error(`Error fetching room type analytics: ${error.message}`);
        }
    }

    public static async getRatePlanAnalytics(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const ratePlanStats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$ratePlanCode",
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                // Add projection for consistency
                {
                    $project: {
                        _id: 0,
                        ratePlanCode: "$_id",
                        totalReservations: 1,
                        totalRevenue: 1,
                        averageReservationValue: 1,
                        totalRooms: 1,
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
            ]);

            return ratePlanStats;
        } catch (error) {
            throw new Error(`Error fetching rate plan analytics: ${error.message}`);
        }
    }

    public static async getCurrencyAnalytics(
        startDate?: Date,
        endDate?: Date,
        hotelCodes?: string[]
    ) {
        try {
            const matchCondition = this.buildMatchCondition(startDate, endDate, hotelCodes);

            const currencyStats = await ThirdPartyBooking.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: "$currencyCode",
                        totalReservations: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: 0
                                }
                            }
                        },
                        averageReservationValue: {
                            $avg: {
                                $cond: {
                                    if: { $eq: ["$status", "Confirmed"] },
                                    then: "$totalAmount",
                                    else: null
                                }
                            }
                        },
                        totalRooms: { $sum: "$numberOfRooms" },
                    },
                },
                // Add projection for consistency
                {
                    $project: {
                        _id: 0,
                        currencyCode: "$_id",
                        totalReservations: 1,
                        totalRevenue: 1,
                        averageReservationValue: 1,
                        totalRooms: 1,
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
            ]);

            return currencyStats;
        } catch (error) {
            throw new Error(`Error fetching currency analytics: ${error.message}`);
        }
    }
}