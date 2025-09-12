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

            if (!requestInventoryData.hotelCode || !requestInventoryData.hotelName || !requestInventoryData.invTypeCode || !requestInventoryData.availability) {
                return res.status(400).json({ message: "Missing required fields: hotelCode, hotelName, invTypeCode, availability" });
            }

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