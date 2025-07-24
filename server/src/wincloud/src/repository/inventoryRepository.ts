import { Inventory } from '../model/inventoryModel';
import { InventoryData } from '../interface/inventoryInterface';

export class InventoryRepository {
  async upsertInventory(data: InventoryData[]): Promise<any> {
    const operations = data.map(data => ({
      updateOne: {
        filter: {
          hotelCode: data.hotelCode,
          invTypeCode: data.invTypeCode,
          'availability.startDate': new Date(data.availability.startDate),
        },
        update: {
          $set: {
            'availability.endDate': new Date(data.availability.endDate),
            'availability.count': data.availability.count,
            updatedAt: new Date(),
          }
        },
        upsert: true
      }

    }));

    return Inventory.bulkWrite(operations);
  }
}