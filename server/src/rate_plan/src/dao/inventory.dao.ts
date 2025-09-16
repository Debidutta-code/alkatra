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
            console.log("Invalid input:", { hotelCode, invTypeCode, dateStatusList });
            throw new Error("Invalid input parameters for inventory update");
        }

        // Validate each item in dateStatusList
        for (const item of dateStatusList) {
            if (!item.date || !item.status || !['open', 'close'].includes(item.status)) {
                console.log("Invalid item:", item);
                throw new Error("Each item must have a valid date and status ('open' or 'close')");
            }
            // Validate date format
            if (isNaN(new Date(item.date).getTime())) {
                console.log("Invalid date:", item.date);
                throw new Error(`Invalid date format for ${item.date}`);
            }
        }

        let matchedCount = 0;
        let modifiedCount = 0;

        for (const { date, status } of dateStatusList) {
            const startDate = new Date(date);
            const doc = await Inventory.findOne({
                hotelCode,
                invTypeCode,
                "availability.startDate": startDate,
            });

            if (!doc) {
                console.log(`No inventory document found for date: ${date}`);
                continue; // Skip if no document exists; alternatively, you could throw an error or upsert here
            }

            matchedCount++;

            const currentStatus = doc.status;

            if (currentStatus === undefined || currentStatus === null || currentStatus !== status) {
                // Update if status is missing or doesn't match
                await Inventory.updateOne(
                    { _id: doc._id },
                    {
                        $set: {
                            status: status,
                            updatedAt: new Date(),
                        },
                    }
                );
                modifiedCount++;
                console.log(`Updated status for date ${date} from ${currentStatus} to ${status}`);
            } else {
                console.log(`Status for date ${date} already matches: ${status}. No update needed.`);
            }
        }

        return {
            matchedCount,
            modifiedCount
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