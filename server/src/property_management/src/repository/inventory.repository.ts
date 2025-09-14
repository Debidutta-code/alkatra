// repository/inventory.repository.ts
import { Inventory } from "../../../wincloud/src/model/inventoryModel";
import { PropertyInfo } from '../model/property.info.model';
import { Room } from '../model/room.model';

export class InventoryRepository {
    private static instance: InventoryRepository;

    private constructor() { }

    public static getInstance(): InventoryRepository {
        if (!InventoryRepository.instance) {
            InventoryRepository.instance = new InventoryRepository();
        }
        return InventoryRepository.instance;
    }

    async findHotelByHotelCode(hotelCode: string) {
        return await PropertyInfo.findOne({ property_code: hotelCode }).select('property_name');
    }

    async findRoomTypeByInvTypeCode(invTypeCode: string) {
        return await Room.findOne({ room_type: invTypeCode }).select('room_type');
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
        const dateWiseData = [];

        // Loop through each date between start and end (inclusive)
        for (
            let date = new Date(start.getTime());
            date <= end;
            date.setUTCDate(date.getUTCDate() + 1)
        ) {
            // Create UTC midnight date
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth();
            const day = date.getUTCDate();
            const utcMidnight = new Date(Date.UTC(year, month, day)); // Always 00:00:00.000Z

            dateWiseData.push({
                hotelCode,
                invTypeCode,
                availability: {
                    startDate: utcMidnight,
                    endDate: utcMidnight,
                    count: availability.count
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return dateWiseData;
    }


    async createInventory(data: any) {
        try {

            // If data is an array, process each item
            if (Array.isArray(data)) {
                const results = [];
                for (const item of data) {
                    const result = await this.upsertInventory(item);
                    results.push(result);
                }
                return results;
            }

            // If data is a single object
            return await this.upsertInventory(data);
        } catch (error) {
            console.error('Error creating inventory:', error);
            throw new Error(`Failed to create inventory: ${error}`);
        }
    }

    private async upsertInventory(item: any) {
        const { hotelCode, invTypeCode, availability } = item;

        return await Inventory.findOneAndUpdate(
            {
                hotelCode: hotelCode,
                invTypeCode: invTypeCode,
                'availability.startDate': availability.startDate,
                'availability.endDate': availability.endDate
            },
            {
                $set: {
                    'availability.count': availability.count,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );
    }
}