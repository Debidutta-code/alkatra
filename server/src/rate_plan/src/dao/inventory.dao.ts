import { Inventory } from "../../../wincloud/src/model/inventoryModel";

export class InventoryDao {
    private static instance: InventoryDao;

    private constructor() { }

    static getInstance(): InventoryDao {
        if (!InventoryDao.instance) {
            InventoryDao.instance = new InventoryDao();
        }
        return InventoryDao.instance;
    }

    async inventoryUpdate(hotelCode: string, invTypeCode: string, dateStatusList: { date: string, status: string }[]) {
        // Validate input parameters
        if (!hotelCode || !invTypeCode || !dateStatusList || !Array.isArray(dateStatusList) || dateStatusList.length === 0) {
            throw new Error("Invalid input parameters for inventory update");
        }

        // Validate each item in dateStatusList
        for (const item of dateStatusList) {
            if (!item.date || !item.status || !['open', 'close'].includes(item.status)) {
                throw new Error("Each item must have a valid date and status ('open' or 'close')");
            }
            // Validate date format
            if (isNaN(new Date(item.date).getTime())) {
                throw new Error(`Invalid date format for ${item.date}`);
            }
        }

        // Group updates by date to optimize database operations
        // Updates the status to the provided value, regardless of the existing status
        const updates = dateStatusList.map(({ date, status }) => ({
            updateOne: {
                filter: {
                    hotelCode,
                    invTypeCode,
                    "availability.startDate": date,
                },
                update: {
                    $set: {
                        status: status,
                    },
                },
            },
        }));

        const updateInventories = await Inventory.bulkWrite(updates);

        return {
            matchedCount: updateInventories.matchedCount,
            modifiedCount: updateInventories.modifiedCount
        };
    }

    // async inventoryUpdate(hotelCode: string, invTypeCode: string, ratePlanCode: string, dates: string[]) {
    //     if (!hotelCode || !invTypeCode || !dates || dates.length === 0) {
    //         throw new Error("Invalid input parameters for inventory update");
    //     }

    //     try {
    //         let updateInventories;
    //         updateInventories = await Inventory.updateMany(
    //             {
    //                 hotelCode,
    //                 invTypeCode,
    //                 "availability.startDate": { $in: dates },
    //             },
    //             [
    //                 {
    //                     $set: {
    //                         status: {
    //                             $cond: {
    //                                 if: { $eq: [{ $type: "$status" }, "missing"] },
    //                                 then: "close",
    //                                 else: {
    //                                     $cond: {
    //                                         if: { $eq: ["$status", "open"] },
    //                                         then: "close",
    //                                         else: "open",
    //                                     },
    //                                 },
    //                             },
    //                         },
    //                     },
    //                 },
    //             ]
    //         );

    //         if (!updateInventories) {
    //             throw new Error("Failed to update inventory");
    //         }

    //         return {
    //             matchedCount: updateInventories.matchedCount,
    //             modifiedCount: updateInventories.modifiedCount,
    //             acknowledged: updateInventories.acknowledged,
    //         };
    //     } catch (error) {
    //         throw new Error(`Error updating inventory: ${error.message}`);
    //     }
    // }
}