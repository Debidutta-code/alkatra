// service/inventory.service.ts
import { IInventory } from '../interface';
import { InventoryRepository } from '../repository';

export class InventoryService {
    private static instance: InventoryService;
    private inventoryRepository: InventoryRepository;

    private constructor() {  // Remove param to match getInstance
        this.inventoryRepository = InventoryRepository.getInstance();
    }

    public static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }
        return InventoryService.instance;
    }

    async inventoryCreate(data: Partial<IInventory>) {
        try {
            
            const hotelName = await this.inventoryRepository.findHotelByHotelCode(data.hotelCode);
            if (!hotelName) {
                throw new Error("Hotel not found with the given hotel code");
            }
            
            const invTypeDetails = await this.inventoryRepository.findRoomTypeByInvTypeCode(data.invTypeCode);
            if (!invTypeDetails) {
                throw new Error("Inventory Type Code not found");
            }

            // Map input to model structure (fix field mismatches)
            const inventoryCreateData: Partial<IInventory> = {
                hotelCode: data.hotelCode,
                hotelName: data.hotelName || 'Unknown',  // Fallback if validation is off
                invTypeCode: data.invTypeCode,
                availability: data.availability  // Direct mapping to Availability object
            };

            return await this.inventoryRepository.createInventory(inventoryCreateData);
        } catch (error) {
            console.error('Error in inventoryCreate service:', error);
            throw error;
        }
    }
}