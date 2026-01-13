import RateAmount from '../../../wincloud/src/model/ratePlanDateWise.model';
import { Inventory } from '../../../wincloud/src/model/inventoryModel';

interface RatePlanData {
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  ratePlanCode: string;
  date: Date;
  currencyCode: string;
  baseRate: number;
  ratePlanName: string;
  restrictions: any;
  dataSource: string;
}

interface RatePlanDetailedData {
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  ratePlanCode: string;
  ratePlanName: string;
  date: Date;
  currencyCode: string;
  baseByGuestAmts: Array<{
    amountBeforeTax: number;
    numberOfGuests: number;
  }>;
  additionalGuestAmounts: Array<{
    ageQualifyingCode: string;
    amount: number;
  }>;
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
  };
  dataSource: string;
  restrictions: any;
}

interface InventoryData {
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  date: Date;
  available: number;
  sold: number;
  blocked: number;
  dataSource: string;
}

export class ARIRepository {
  /**
   * Get existing data source for a hotel
   */
  async getExistingDataSource(hotelCode: string): Promise<string | null> {
    try {
      // Check rate plan data first
      const rateData = await RateAmount.findOne({ hotelCode }).select('dataSource').lean();
      if (rateData && (rateData as any).dataSource) {
        return (rateData as any).dataSource;
      }

      // Check inventory data
      const inventoryData = await Inventory.findOne({ hotelCode }).select('dataSource').lean();
      if (inventoryData && (inventoryData as any).dataSource) {
        return (inventoryData as any).dataSource;
      }

      return null;
    } catch (error: any) {
      console.error('Error getting existing data source:', error);
      return null;
    }
  }

  /**
   * Clear all rate plan and inventory data for a hotel
   */
  async clearAllDataForHotel(hotelCode: string): Promise<void> {
    try {
      console.log(`Deleting all rate plans for hotel: ${hotelCode}`);
      const ratePlanResult = await RateAmount.deleteMany({ hotelCode });
      console.log(`   Deleted ${ratePlanResult.deletedCount} rate plan records`);

      console.log(`Deleting all inventory for hotel: ${hotelCode}`);
      const inventoryResult = await Inventory.deleteMany({ hotelCode });
      console.log(`   Deleted ${inventoryResult.deletedCount} inventory records`);
    } catch (error: any) {
      console.error('Error clearing hotel data:', error);
      throw new Error(`Failed to clear hotel data: ${error.message}`);
    }
  }

    /**
   * Upsert rate plan data (update if exists, insert if new)
   */
  async upsertRatePlan(data: RatePlanData): Promise<void> {
    try {
      const startDate = new Date(data.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(data.date);
      endDate.setHours(23, 59, 59, 999);

      // Create the filter to find existing rate plan
      const filter = {
        hotelCode: data.hotelCode,
        invTypeCode: data.invTypeCode,
        ratePlanCode: data.ratePlanCode,
        startDate: startDate,
        endDate: endDate
      };

      // Prepare update data
      const updateData = {
        hotelCode: data.hotelCode,
        hotelName: data.hotelName,
        invTypeCode: data.invTypeCode,
        ratePlanCode: data.ratePlanCode,
        startDate: startDate,
        endDate: endDate,
        currencyCode: data.currencyCode,
        baseByGuestAmts: [
          {
            amountBeforeTax: data.baseRate,
            numberOfGuests: 1
          }
        ],
        additionalGuestAmounts: [],
        days: {
          mon: true,
          tue: true,
          wed: true,
          thu: true,
          fri: true,
          sat: true,
          sun: true
        },
        dataSource: data.dataSource, // Track data source
        restrictions: data.restrictions || {} // Store restrictions
      };

      // Upsert: update if exists, insert if not
      await RateAmount.findOneAndUpdate(
        filter,
        { $set: updateData },
        { upsert: true, new: true }
      );

      console.log(`      ✅ Rate plan upserted: ${data.ratePlanCode}`);
    } catch (error: any) {
      console.error('Error upserting rate plan:', error);
      throw new Error(`Failed to upsert rate plan: ${error.message}`);
    }
  }

  /**
   * Upsert detailed rate plan data with full pricing information
   */
  async upsertRatePlanDetailed(data: RatePlanDetailedData): Promise<void> {
    try {
      const startDate = new Date(data.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(data.date);
      endDate.setHours(23, 59, 59, 999);

      // Create the filter to find existing rate plan
      const filter = {
        hotelCode: data.hotelCode,
        invTypeCode: data.invTypeCode,
        ratePlanCode: data.ratePlanCode,
        startDate: startDate,
        endDate: endDate
      };

      // Prepare update data
      const updateData = {
        hotelCode: data.hotelCode,
        hotelName: data.hotelName,
        invTypeCode: data.invTypeCode,
        ratePlanCode: data.ratePlanCode,
        startDate: startDate,
        endDate: endDate,
        currencyCode: data.currencyCode,
        baseByGuestAmts: data.baseByGuestAmts,
        additionalGuestAmounts: data.additionalGuestAmounts,
        days: data.days,
        dataSource: data.dataSource,
        restrictions: data.restrictions || {}
      };

      // Upsert: update if exists, insert if not
      await RateAmount.findOneAndUpdate(
        filter,
        { $set: updateData },
        { upsert: true, new: true }
      );

      console.log(`      ✅ Detailed rate plan upserted: ${data.ratePlanCode}`);
    } catch (error: any) {
      console.error('Error upserting detailed rate plan:', error);
      throw new Error(`Failed to upsert detailed rate plan: ${error.message}`);
    }
  }

  /**
   * Upsert inventory data
   */
  async upsertInventory(data: InventoryData): Promise<void> {
    try {
      const startDate = new Date(data.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(data.date);
      endDate.setHours(23, 59, 59, 999);

      const filter = {
        hotelCode: data.hotelCode,
        invTypeCode: data.invTypeCode,
        'availability.startDate': startDate,
        'availability.endDate': endDate
      };

      const updateData = {
        hotelCode: data.hotelCode,
        hotelName: data.hotelName,
        invTypeCode: data.invTypeCode,
        availability: {
          startDate: startDate,
          endDate: endDate,
          count: data.available
        },
        status: 'active',
        dataSource: data.dataSource, // Track data source
        sold: data.sold, // Additional tracking
        blocked: data.blocked // Additional tracking
      };

      await Inventory.findOneAndUpdate(
        filter,
        { $set: updateData },
        { upsert: true, new: true }
      );

      console.log(`      ✅ Inventory upserted: ${data.invTypeCode} - Available: ${data.available}`);
    } catch (error: any) {
      console.error('Error upserting inventory:', error);
      throw new Error(`Failed to upsert inventory: ${error.message}`);
    }
  }

  /**
   * Get all rate plans for a property
   */
  async getRatePlansForProperty(hotelCode: string): Promise<any[]> {
    try {
      return await RateAmount.find({ hotelCode })
        .sort({ startDate: 1 })
        .lean();
    } catch (error: any) {
      throw new Error(`Failed to get rate plans: ${error.message}`);
    }
  }

  /**
   * Get all inventory for a property
   */
  async getInventoryForProperty(hotelCode: string): Promise<any[]> {
    try {
      return await Inventory.find({ hotelCode })
        .sort({ 'availability.startDate': 1 })
        .lean();
    } catch (error: any) {
      throw new Error(`Failed to get inventory: ${error.message}`);
    }
  }
}
