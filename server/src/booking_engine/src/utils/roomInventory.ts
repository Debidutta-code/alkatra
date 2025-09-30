import { Inventory } from "../../../wincloud/src/model/inventoryModel";

export const reduceRoomsAfterBookingConfirmed = async (
    hotelCode: string,
    roomTypeCode: string,
    numberOfRooms: number,
    dates: Date[]
) => {
    console.log(`Get data for reduce rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

    const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
    const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'dates' && (!Array.isArray(value) || value.length !== 2)))
        .map(([key]) => key);

    if (missingFields.length > 0) {
        return {
            message: `Missing required fields: ${missingFields.join(", ")}`,
        };
    }

    const [checkInDate, checkOutDate] = dates;

    if (checkInDate >= checkOutDate) {
        return {
            message: "Check-in date must be before check-out date",
        };
    }

    try {
        const dateRange: Date[] = [];
        let currentDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        while (currentDate < endDate) {
            dateRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const inventoryRecords = await Inventory.find({
            hotelCode,
            invTypeCode: roomTypeCode,
            'availability.startDate': {
                $in: dateRange,
            },
        });

        if (!inventoryRecords || inventoryRecords.length === 0) {
            return { message: "No available rooms found for the specified criteria" };
        }

        const bulkOps: Array<{ updateOne: { filter: any; update: any } }> = [];

        for (const item of inventoryRecords) {
            const currentCount = item.availability?.count || 0;
            if (currentCount < numberOfRooms) {
                return {
                    message: `Not enough rooms for date ${item.availability?.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`,
                };
            }

            const newCount = currentCount - numberOfRooms;

            bulkOps.push({
                updateOne: {
                    filter: { _id: item._id },
                    update: {
                        $set: {
                            'availability.count': newCount,
                            updatedAt: new Date(),
                        },
                    },
                },
            });
        }

        const result = await Inventory.bulkWrite(bulkOps);

        return {
            message: "Room counts reduced successfully for booking",
            result,
        };

    } catch (error: any) {
        console.error("❌ Error reducing rooms after booking confirmed:", error.message || error);
        return { message: "Failed to reduce rooms after booking confirmed" };
    }
};