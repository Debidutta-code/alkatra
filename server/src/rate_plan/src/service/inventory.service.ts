import { InventoryDao } from "../dao/inventory.dao";

export class InventoryService {

    /**
     * Singleton instance
     */
    private static instance: InventoryService;
    private inventoryDao: InventoryDao;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this.inventoryDao = InventoryDao.getInstance();
    }
    /**
     * Get the singleton instance of InventoryService
     * @returns {InventoryService} Singleton instance of InventoryService
     */
    static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }
        return InventoryService.instance;
    }

    async updateInventory(hotelCode: string, invTypeCode: string, ratePlanCode: string, startDate: string, endDate: string) {
        try {
            if (!hotelCode || !invTypeCode || !startDate || !endDate) {
                throw new Error("Invalid input parameters for inventory update");
            }

            const dates = await this.generateDateRange(startDate, endDate);

            const inventoryUpdateDaoResponse = await this.inventoryDao.inventoryUpdate(hotelCode, invTypeCode, ratePlanCode, dates);
            if (!inventoryUpdateDaoResponse) {
                throw new Error("Failed to update inventory at DAO Layer");
            }
            return inventoryUpdateDaoResponse;
        }
        catch (error: any) {
            console.log("Failed to update inventory at Service Layer:", error);
            throw new Error("Failed to update inventory at Service Layer");
        }
    }

    // Helper function to generate date range
    private async generateDateRange(startDate: string, endDate: string): Promise<string[]> {
        const dates: string[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date format");
        }

        if (start > end) {
            throw new Error("Start date cannot be after end date");
        }

        const currentDate = new Date(start);

        while (currentDate <= end) {
            const dateString = currentDate.toISOString().split('T')[0];
            dates.push(dateString);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }
}