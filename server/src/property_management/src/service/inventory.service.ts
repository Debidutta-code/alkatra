// service/inventory.service.ts
import { date } from 'zod';
import { IInventory } from '../interface';
import { InventoryRepository } from '../repository';

export class InventoryService {
    private static instance: InventoryService;
    private inventoryRepository: InventoryRepository;

    private constructor() {
        this.inventoryRepository = InventoryRepository.getInstance();
    }

    public static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }
        return InventoryService.instance;
    }

    async inventoryCreate(data: any) {

        const hotelName = await this.inventoryRepository.findHotelByHotelCode(data.hotelCode);
        if (!hotelName) {
            throw new Error("Hotel not found with the given hotel code");
        }

        const invType = await this.inventoryRepository.findRoomTypeByInvTypeCode(data.invTypeCode);
        if (!invType) {
            throw new Error("Inventory Type Code not found");
        }


        const inventoryCreateData = {
            hotelCode: data.hotelCode,
            hotelName: hotelName.property_name,
            invTypeCode: invType.room_type,
            availability: data.availability
        };

        const dateWiseData = await this.inventoryRepository.generateDateWiseInventory(inventoryCreateData);
        if (dateWiseData.length === 0) {
            throw new Error("Failed to create date wise inventory records");
        }

        return await this.inventoryRepository.createInventory(dateWiseData);
    }
}