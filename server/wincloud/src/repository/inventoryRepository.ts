import { Inventory } from '../model/inventoryModel';
import { InventoryData } from '../interface/inventoryInterface';

export class InventoryRepository {
  async upsertInventory(data: InventoryData): Promise<any> {
    console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Upserting inventory for hotel: ${JSON.stringify(data, null, 2)}`);
    const query = {
      hotelCode: data.hotelCode,
      hotelName: data.hotelName,
      invTypeCode: data.invTypeCode,
    };

    const update = {
      $set: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        count: data.count,
        updatedAt: new Date(),
      },
    };

    const options = {
      upsert: true,
      new: true,
    };

    const updatedInventory = await Inventory.findOneAndUpdate(query, update, options);
    return updatedInventory.toJSON();
  }

  async createInventory(data: InventoryData): Promise<any> {
    console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Creating inventory for hotel: ${JSON.stringify(data, null, 2)}`);
    const inventory = new Inventory({
      hotelCode: data.hotelCode,
      hotelName: data.hotelName,
      invTypeCode: data.invTypeCode,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      count: data.count,
    });
    const savedInventory = await inventory.save();
    return savedInventory.toJSON();
  }
}