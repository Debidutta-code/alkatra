// repository/inventory.repository.ts
import { Inventory } from "../../../wincloud/src/model/inventoryModel";  // Fix path if needed
import { PropertyInfo } from '../model/property.info.model';
import { Room } from '../model/room.model';
import { IInventory } from '../interface';  // Import interface

export class InventoryRepository {
    private static instance: InventoryRepository;

    private constructor() { }

    static getInstance(): InventoryRepository {
        if (!InventoryRepository.instance) {
            InventoryRepository.instance = new InventoryRepository();
        }
        return InventoryRepository.instance;
    }

    async findHotelByHotelCode(hotelCode: string) {
        return await PropertyInfo.findOne({ property_code: hotelCode }).select('property_name');
    }

    async findRoomTypeByInvTypeCode(invTypeCode: string) {
        return await Room.findOne({ room_type_code: invTypeCode }).select('room_type');
    }

    /**
     * Generating Date Wise Inventory
     * @param data 
     */
    async generateDateWiseInventory(data: any) {
        const { hotelCode, hotelName, invTypeCode, availability } = data;

        if (!hotelCode || !hotelName || !invTypeCode || !availability?.startDate || !availability?.endDate || !availability?.count) {
            throw new Error('Missing required fields: hotelCode, hotelName, invTypeCode, or availability details');
        }

        const start = new Date(availability.startDate);
        const end = new Date(availability.endDate);
        const dateWiseData: Partial<IInventory>[] = [];

        // Generate one record per day from startDate to endDate (exclusive)
        for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999

            dateWiseData.push({
                hotelCode,
                hotelName,
                invTypeCode,
                availability: {
                    startDate: startOfDay,
                    endDate: endOfDay,
                    count: availability.count
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return dateWiseData;
    }

    async createInventory(data: Partial<IInventory>) {
        try {
            const newInventory = new Inventory(data);
            return await newInventory.save();
        } catch (error) {
            console.error('Error creating inventory:', error);
            throw new Error(`Failed to create inventory: ${error}`);
        }
    }
}