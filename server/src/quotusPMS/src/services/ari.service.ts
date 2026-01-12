import { ARIPayload, ARIProcessingResult, ARIValidationResult } from '../interfaces/ari.interface';
import { ARIRepository } from '../repositories/ari.repository';
import { PropertyInfo } from '../../../property_management/src/model/property.info.model';

export class ARIService {
  private repository: ARIRepository;

  constructor() {
    this.repository = new ARIRepository();
  }

  /**
   * Validate ARI payload structure
   */
  private validateARIPayload(payload: ARIPayload): ARIValidationResult {
    const errors: string[] = [];

    if (!payload.propertyCode) {
      errors.push('propertyCode is required');
    }

    if (!payload.propertyName) {
      errors.push('propertyName is required');
    }

    if (!payload.timestamp) {
      errors.push('timestamp is required');
    }

    if (!payload.inventory || !Array.isArray(payload.inventory)) {
      errors.push('inventory array is required');
    } else if (payload.inventory.length === 0) {
      errors.push('inventory array cannot be empty');
    } else {
      // Validate each inventory item
      payload.inventory.forEach((item, index) => {
        if (!item.invTypeCode) {
          errors.push(`inventory[${index}]: invTypeCode is required`);
        }
        if (!item.date) {
          errors.push(`inventory[${index}]: date is required`);
        }
        if (typeof item.available !== 'number') {
          errors.push(`inventory[${index}]: available must be a number`);
        }
        if (!item.rates || !Array.isArray(item.rates)) {
          errors.push(`inventory[${index}]: rates array is required`);
        } else {
          item.rates.forEach((rate, rateIndex) => {
            if (!rate.ratePlanCode) {
              errors.push(`inventory[${index}].rates[${rateIndex}]: ratePlanCode is required`);
            }
            if (typeof rate.baseRate !== 'number') {
              errors.push(`inventory[${index}].rates[${rateIndex}]: baseRate must be a number`);
            }
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Process ARI data from QuotusPMS
   */
  async processARIData(payload: ARIPayload): Promise<ARIProcessingResult> {
    try {
      console.log('\n🔄 Starting ARI Data Processing...');

      // Step 1: Validate payload
      const validation = this.validateARIPayload(payload);
      if (!validation.valid) {
        return {
          success: false,
          message: 'ARI payload validation failed',
          errors: validation.errors
        };
      }

      // Step 2: Find property by property code
      const property = await PropertyInfo.findOne({ property_code: payload.propertyCode })
        .populate('dataSource')
        .lean();

      if (!property) {
        return {
          success: false,
          message: `Property not found with code: ${payload.propertyCode}`,
          errors: ['Property not found']
        };
      }

      console.log('✅ Property found:', property.property_name);
      console.log('Property ID:', property._id);

      const dataSource = property.dataSource as any;
      const currentDataSourceName = dataSource?.name || 'Internal';
      
      console.log('Current Data Source:', currentDataSourceName);

      // Step 3: Check if data source has changed
      const existingDataSource = await this.repository.getExistingDataSource(payload.propertyCode);
      console.log('Existing Data Source in DB:', existingDataSource || 'None');

      let shouldClearExistingData = false;

      if (existingDataSource && existingDataSource !== currentDataSourceName) {
        console.log('\n⚠️  Data Source Changed!');
        console.log(`Old: ${existingDataSource} → New: ${currentDataSourceName}`);
        console.log('Clearing all existing rate plan and inventory data...');
        shouldClearExistingData = true;

        // Clear all existing data for this hotel
        await this.repository.clearAllDataForHotel(payload.propertyCode);
        console.log('✅ Existing data cleared');
      } else if (!existingDataSource) {
        console.log('\n📝 First time receiving data for this property');
      } else {
        console.log('\n✅ Data source matches - will upsert data');
      }

      // Step 4: Process inventory data
      const datesProcessed: string[] = [];
      let ratePlansProcessed = 0;
      let inventoryRecordsProcessed = 0;

      for (const inventoryItem of payload.inventory) {
        const date = inventoryItem.date;
        datesProcessed.push(date);

        console.log(`\n📅 Processing Date: ${date}`);
        console.log(`   Room Type: ${inventoryItem.invTypeCode} (${inventoryItem.invTypeName})`);
        console.log(`   Available: ${inventoryItem.available}, Sold: ${inventoryItem.sold}, Blocked: ${inventoryItem.blocked}`);

        // Process each rate plan for this date
        for (const rate of inventoryItem.rates) {
          console.log(`   💰 Rate Plan: ${rate.ratePlanCode} - ${rate.ratePlanName}`);
          console.log(`      Base Rate: ${rate.currencyCode} ${rate.baseRate}`);

          // Upsert rate plan data
          await this.repository.upsertRatePlan({
            hotelCode: payload.propertyCode,
            hotelName: payload.propertyName,
            invTypeCode: inventoryItem.invTypeCode,
            ratePlanCode: rate.ratePlanCode,
            date: new Date(date),
            currencyCode: rate.currencyCode,
            baseRate: rate.baseRate,
            ratePlanName: rate.ratePlanName,
            restrictions: rate.restrictions,
            dataSource: currentDataSourceName
          });

          ratePlansProcessed++;
        }

        // Upsert inventory data
        await this.repository.upsertInventory({
          hotelCode: payload.propertyCode,
          hotelName: payload.propertyName,
          invTypeCode: inventoryItem.invTypeCode,
          date: new Date(date),
          available: inventoryItem.available,
          sold: inventoryItem.sold,
          blocked: inventoryItem.blocked,
          dataSource: currentDataSourceName
        });

        inventoryRecordsProcessed++;
      }

      console.log('\n✅ ARI Processing Complete');
      console.log(`   Dates: ${datesProcessed.length}`);
      console.log(`   Rate Plans: ${ratePlansProcessed}`);
      console.log(`   Inventory Records: ${inventoryRecordsProcessed}`);

      return {
        success: true,
        message: 'ARI data processed successfully',
        propertyCode: payload.propertyCode,
        datesProcessed,
        ratePlansProcessed,
        inventoryRecordsProcessed
      };
    } catch (error: any) {
      console.error('❌ ARI Service Error:', error);
      return {
        success: false,
        message: 'Failed to process ARI data',
        errors: [error.message]
      };
    }
  }

  /**
   * Get current ARI data for a property
   */
  async getPropertyARIData(propertyCode: string) {
    try {
      const ratePlans = await this.repository.getRatePlansForProperty(propertyCode);
      const inventory = await this.repository.getInventoryForProperty(propertyCode);

      return {
        propertyCode,
        ratePlans: ratePlans.length,
        inventory: inventory.length,
        dataSource: ratePlans[0]?.dataSource || null,
        ratePlansData: ratePlans,
        inventoryData: inventory
      };
    } catch (error: any) {
      throw new Error(`Failed to get ARI data: ${error.message}`);
    }
  }
}
