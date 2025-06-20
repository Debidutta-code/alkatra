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

  // async createInventory(data: InventoryData): Promise<any> {
  //   // console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Creating inventory for hotel: ${JSON.stringify(data, null, 2)}`);
  //   // const inventory = new Inventory({
  //   //   hotelCode: data.hotelCode,
  //   //   // hotelName: data.hotelName,
  //   //   invTypeCode: data.invTypeCode,
  //   //   startDate: new Date(data.startDate),
  //   //   endDate: new Date(data.endDate),
  //   //   count: data.count,
  //   // });

  //   const inventory = new Inventory({
  //     hotelCode: data.hotelCode,
  //     invTypeCode: data.invTypeCode,
  //     availability: {
  //       startDate: new Date(data.availability.startDate),
  //       endDate: new Date(data.availability.endDate),
  //       count: data.availability.count,
  //     }
  //   });
  //   const savedInventory = await inventory.save();
  //   return savedInventory.toJSON();
  // }
}