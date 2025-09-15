import { InventoryDao } from "../dao/inventory.dao";

export class InventoryService {
    private static instance: InventoryService;
    private inventoryDao: InventoryDao;

    private constructor() {
        this.inventoryDao = InventoryDao.getInstance();
    }

    static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }
        return InventoryService.instance;
    }

    /**
     * Inventory update service method
     * @param hotelCode 
     * @param invTypeCode 
     * @param ratePlanCode 
     * @param startDate 
     * @param endDate 
     * @returns 
     */

    async updateInventory(hotelCode: string, invTypeCode: string, dateStatusList: { date: string, status: string }[]) {
        console.log("Enter into service layer for inventory update");

        // Validate dateStatusList entries
        for (const item of dateStatusList) {
            if (!item.date || !item.status || !['open', 'close'].includes(item.status)) {
                throw new Error("Each item must have a valid date and status ('open' or 'close')");
            }
            // Validate date format
            if (isNaN(new Date(item.date).getTime())) {
                throw new Error(`Invalid date format for ${item.date}`);
            }
        }

        const inventoryUpdateDaoResponse = await this.inventoryDao.inventoryUpdate(hotelCode, invTypeCode, dateStatusList);
        return inventoryUpdateDaoResponse;
    }
    // async updateInventory(hotelCode: string, invTypeCode: string, ratePlanCode: string, startDate: string, endDate: string) {
    //     try {
    //         console.log("Enter into service layer for inventory update");
    //         if (!hotelCode || !invTypeCode || !startDate || !endDate) {
    //             throw new Error("Invalid input parameters for inventory update");
    //         }

    //         const dates = await this.generateDateRange(startDate, endDate);
    //         if (dates.length === 0) {
    //             throw new Error("No dates generated for the given range");
    //         }
    //         console.log("############## Generated dates for inventory update:", dates);

    //         const inventoryUpdateDaoResponse = await this.inventoryDao.inventoryUpdate(hotelCode, invTypeCode, ratePlanCode, dates);
    //         if (!inventoryUpdateDaoResponse) {
    //             throw new Error("Failed to update inventory at DAO Layer");
    //         }
    //         return inventoryUpdateDaoResponse;
    //     } catch (error: any) {
    //         console.log("Failed to update inventory at Service Layer:", error);
    //         throw new Error("Failed to update inventory at Service Layer");
    //     }
    // }

    /**
     * Found the date range between two dates
     * Used in inventory update method
     * @param startDate 
     * @param endDate 
     * @returns 
     */
    private async generateDateRange(startDate: string, endDate: string): Promise<string[]> {
        const dates: string[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date format");
        }

        if (start >= end) {
            throw new Error("Start date cannot be after end date");
        }

        const currentDate = new Date(start);

        while (currentDate <= end) {
            const dateString = currentDate.toISOString().split("T")[0];
            // const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toISOString();
            dates.push(dateString);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }
}   