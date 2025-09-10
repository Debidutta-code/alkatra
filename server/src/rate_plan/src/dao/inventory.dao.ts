import { Inventory } from "../../../wincloud/src/model/inventoryModel"

export class InventoryDao {

    private static instance: InventoryDao

    private constructor() { }

    static getInstance(): InventoryDao {
        if (!InventoryDao.instance) {
            InventoryDao.instance = new InventoryDao()
        }
        return InventoryDao.instance
    }

    async inventoryUpdate(hotelCode: string, invTypeCode: string, ratePlanCode: string, dates: string[]) {
        if (!hotelCode || !invTypeCode || !dates || dates.length === 0) {
            throw new Error("Invalid input parameters for inventory update");
        }

        try {

            const updateInventories = await Inventory.updateMany(
                {
                    hotelCode,
                    invTypeCode,
                    ratePlanCode,
                    "availability.startDate": { $in: dates },
                },
                [
                    {
                        $set: {
                            status: {
                                $cond: {
                                    if: { $eq: [{ $type: "$status" }, "missing"] },
                                    then: "close",
                                    else: {
                                        $cond: {
                                            if: { $eq: ["$status", "open"] },
                                            then: "close",
                                            else: "close",
                                        },
                                    },
                                },
                            },
                        },
                    },
                ]
            );

            if (!updateInventories) {
                throw new Error("Failed to update inventory");
            }

            return updateInventories;
        } catch (error) {
            throw new Error(`Error updating inventory: ${error.message}`);
        }
    }
}