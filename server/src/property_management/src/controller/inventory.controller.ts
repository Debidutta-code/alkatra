// controller/inventory.controller.ts
import { Response } from "express";
import { IInventory } from "../interface";
import { InventoryService } from "../service";

export class InventoryHotelier {
    private inventoryService: InventoryService;

    constructor() {
        this.inventoryService = InventoryService.getInstance();
        if (!this.inventoryService) {
            throw new Error('InventoryService instance is null');
        }
    }


    async createInventory(req: any, res: Response) {
        try {
            const requestInventoryData: Partial<IInventory> = req.body;

            // Validate required fields
            if (!requestInventoryData.hotelCode || !requestInventoryData.invTypeCode || !requestInventoryData.availability) {
                return res.status(400).json({ message: "Missing required fields: hotelCode, invTypeCode, availability" });
            }

            // Convert string dates to Date objects if needed
            const startDate = typeof requestInventoryData.availability.startDate === 'string'
                ? new Date(requestInventoryData.availability.startDate)
                : requestInventoryData.availability.startDate;

            const endDate = typeof requestInventoryData.availability.endDate === 'string'
                ? new Date(requestInventoryData.availability.endDate)
                : requestInventoryData.availability.endDate;

            // Validate dates
            if (startDate >= endDate) {
                return res.status(400).json({ message: "Start date cannot be greater than or equal to end date" });
            }

            // Check if dates are in the past - FIXED COMPARISON
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at midnight

            // Compare dates without time (only year, month, day)
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            if (startDateOnly < today || endDateOnly < today) {
                return res.status(400).json({ message: "Dates cannot be in the past" });
            }

            // Ensure count is valid
            if (requestInventoryData.availability.count <= 0) {
                return res.status(400).json({ message: "Availability count must be greater than 0" });
            }

            // Update the dates in the request data (in case they were strings)
            requestInventoryData.availability.startDate = startDate;
            requestInventoryData.availability.endDate = endDate;

            const result = await this.inventoryService.inventoryCreate(requestInventoryData);
            if (!result) {
                return res.status(400).json({ message: "Failed to create inventory" });
            }

            return res.status(201).json({ message: "Inventory created successfully", data: result });
        } catch (error: any) {
            console.error("Error in createInventory controller:", error);
            return res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
}