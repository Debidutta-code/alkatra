import { RatePlan as RatePlanType } from "../common/interface/ratePlan.interface";
import RatePlan from "../model/ratePlan.model";
import RateAmount from "../../../wincloud/src/model/ratePlanDateWise.model"
import { Inventory } from "../../../wincloud/src/model/inventoryModel"
import { startOfDay, endOfDay, addDays } from 'date-fns';

interface UpdatePlanData {
  rateAmountId: string;
  inventoryId: string;
  price: number;
  availability: number;
}

interface IInventory {
  _id: string;
  hotelCode: string;
  hotelName?: string;
  invTypeCode: string;
  ratePlanCode: string;
  availability: { startDate: Date; endDate: Date; count: number };
}

interface IRatePlan {
  _id: string;
  hotelCode: string;
  invTypeCode: string;
  ratePlanCode: string;
  startDate: Date;
  endDate: Date;
  currencyCode: string;
  baseByGuestAmts: { amountBeforeTax: number; numberOfGuests: number }[];
  additionalGuestAmounts: { ageQualifyingCode: string; amount: number }[];
}

interface RoomWithRates {
  _id: string;
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  availability: { startDate: Date; endDate: Date; count: number };
  rates: {
    _id: string;
    currencyCode: string;
    ratePlanCode: string;
    startDate: Date;
    endDate: Date;
    baseByGuestAmts: { amountBeforeTax: number; numberOfGuests: number } | null;
  } | null;
}

class RatePlanDao {


  public static async create(ratePlanData: RatePlanType) {
    try {
      const ratePlan = new RatePlan(ratePlanData);
      return await ratePlan.save();
    }
    catch (error) {
      console.error("Error creating rate plan:", error);
      throw new Error("Failed to create rate plan");
    }
  }

  public static async updateRatePlan(ratePlansData: UpdatePlanData[]) {
    try {
      // Validate input
      if (!Array.isArray(ratePlansData) || ratePlansData.length === 0) {
        throw new Error("ratePlansData must be a non-empty array");
      }
      // Create update promises for each rate plan
      const updatePromises = ratePlansData.map(async (planData, index) => {
        const { rateAmountId, price } = planData;
        let inventoryUpdated = null;
        let rateUpdated = null;
        if (price !== undefined && rateAmountId) {
          console.log("rate amount", rateAmountId)
          rateUpdated = await RateAmount.findByIdAndUpdate(
            rateAmountId,
            {
              $set: {
                "baseByGuestAmts.$[].amountBeforeTax": price
              }
            },
            { new: true, runValidators: true }
          );
          if (!rateUpdated) {
            throw new Error(`Rate Amount update failed for rateAmountId: ${rateAmountId}`);
          }
        }
        if (price === undefined) {
          throw new Error(`No update data provided for index ${index}`);
        }
        return {
          index,
          rateAmountId,
          rateAmount: rateUpdated,
          inventory: inventoryUpdated,
          success: true
        };
      });
      // Wait for all updates to complete (parallel execution)
      const results = await Promise.allSettled(updatePromises);
      const successResults = [];
      const errorResults = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successResults.push(result.value);
        } else {
          errorResults.push({
            index,
            rateAmountId: ratePlansData[index].rateAmountId,
            inventoryId: ratePlansData[index].inventoryId,
            error: result.reason.message,
            success: false
          });
        }
      });
      const response = {
        totalProcessed: ratePlansData.length,
        successCount: successResults.length,
        errorCount: errorResults.length,
        results: successResults,
        errors: errorResults,
        message: `Processed ${ratePlansData.length} rate plans: ${successResults.length} successful, ${errorResults.length} failed`
      };
      // If all updates failed, throw an error
      if (errorResults.length === ratePlansData.length) {
        throw new Error(`All rate plan updates failed: ${errorResults.map(e => e.error).join('; ')}`);
      }
      return response;
    } catch (error) {
      console.error("Error updating rate plans:", error);
      throw error;
    }
  }

  /**
  * Get available rooms with their corresponding rates using aggregation pipeline
  * @hotelCode
  * @invTypeCode
  * @ratePlanCode
  * @page
  * @limit
  */
  public static async getRatePlanByHotel(
    hotelCode: string,
    invTypeCode?: string,
    ratePlanCode?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: RoomWithRates[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalResults: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      resultsPerPage: number;
    };
  }> {
    try {

      const resultsPerPage = limit;
      const skip = (page - 1) * resultsPerPage;

      const [inventory, ratePlans] = await Promise.all([
        this.getInventoryOfHotel(hotelCode, invTypeCode),
        this.getRoomRateOfHotel(hotelCode, invTypeCode, ratePlanCode),
      ]);

      const mappedData = this.mapInventoryToRatePlans(inventory, ratePlans);
      if (!mappedData) {
        throw new Error("No mapped data found");
      }

      const totalResults = mappedData.length;
      const paginatedData = mappedData.slice(skip, skip + resultsPerPage);
      const totalPages = Math.ceil(totalResults / resultsPerPage);

      const result = {
        data: paginatedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          resultsPerPage,
        },
      };


      return result;
    } catch (error) {
      throw new Error(`Failed to fetch rate plans: ${error.message}`);
    }
  }

  /**
   * Helper: Get inventory by hotel
   */
  private static async getInventoryOfHotel(
    hotelCode: string,
    invTypeCode?: string
  ) {
    try {

      const inventoryMatch: any = { hotelCode };
      if (invTypeCode) {
        inventoryMatch.invTypeCode = invTypeCode;
      }

      // if (startDate) {
      //   inventoryMatch["availability.startDate"] = { $gte: startOfDay(startDate) };
      // } else {
      //   inventoryMatch["availability.startDate"] = { $gte: startOfDay(new Date()) };
      // }
      // if (endDate) {
      //   inventoryMatch["availability.endDate"] = { $lte: endOfDay(endDate) };
      // }

      inventoryMatch["availability.startDate"] = { $gte: startOfDay(new Date()) };

      const inventory = await Inventory.aggregate([
        { $match: inventoryMatch },
      ]);

      return inventory;
    } catch (error) {
      console.log(`Failed to fetch inventory: ${error.message}`);
      throw new Error(`Failed to fetch inventory`);
    }
  }

  /**
   * Helper: Get rateplan by hotel
   */

  private static async getRoomRateOfHotel(
    hotelCode: string,
    invTypeCode?: string,
    ratePlanCode?: string
  ) {
    try {

      const ratePlanMatch: any = { hotelCode };
      if (invTypeCode) {
        ratePlanMatch.invTypeCode = invTypeCode;
      }
      if (ratePlanCode) {
        ratePlanMatch.ratePlanCode = ratePlanCode;
      }

      // if (startDate) {
      //   ratePlanMatch.startDate = { $gte: startOfDay(startDate) };
      // } else {
      //   ratePlanMatch.startDate = { $gte: startOfDay(new Date()) };
      // }
      // if (endDate) {
      //   ratePlanMatch.endDate = { $lte: endOfDay(endDate) };
      // }

      ratePlanMatch.startDate = { $gte: startOfDay(new Date()) };

      const ratePlan = await RateAmount.aggregate([
        { $match: ratePlanMatch },
      ]);

      return ratePlan;


    } catch (error) {
      console.log(`Failed to fetch rateplan: ${error.message}`);
      throw new Error(`Failed to fetch rateplan`);
    }
  }

  /**
   * Helper: Map inventory and rate plan
   */
  private static mapInventoryToRatePlans(
    inventory: IInventory[],
    ratePlans: IRatePlan[]
  ): RoomWithRates[] {

    const results: RoomWithRates[] = [];
    
    inventory.forEach((inv) => {
      
      const matchingRates = ratePlans.filter(
        (rate) =>
          rate.hotelCode === inv.hotelCode &&
          rate.invTypeCode === inv.invTypeCode &&
          rate.startDate.getTime() <= inv.availability.startDate.getTime() &&
          rate.endDate.getTime() >= inv.availability.endDate.getTime()
      );

      matchingRates.forEach((matchingRate) => {
        
        const result: RoomWithRates = {
          _id: inv._id,
          hotelCode: inv.hotelCode,
          hotelName: inv.hotelName,
          invTypeCode: inv.invTypeCode,
          availability: inv.availability,
          rates: {
            _id: matchingRate._id,
            currencyCode: matchingRate.currencyCode,
            ratePlanCode: matchingRate.ratePlanCode,
            startDate: matchingRate.startDate,
            endDate: matchingRate.endDate,
            baseByGuestAmts:
              matchingRate.baseByGuestAmts.length > 0
                ? matchingRate.baseByGuestAmts[0]
                : null,
          },
        };

        results.push(result);
      });
    });
    return results;
  }



  public static async getAllRoomType(hotelCode: string) {
    try {
      const response = await Inventory.distinct("invTypeCode", { hotelCode });
      return response;
    } catch (error) {
      throw new Error(error.message)
    }
  }
  public static async getRatePlanByHotelCode(hotelCode: string) {
    return await RatePlan.find(
      { propertyId: hotelCode }
    );
  }
}
export { RatePlanDao };