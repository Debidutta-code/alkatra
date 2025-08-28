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
  */
 
  // public static async getRatePlanByHotel(
  //   hotelCode: string,
  //   invTypeCode?: string,
  //   page?: number,
  //   limit?: number
  // ): Promise<{
  //   data: RoomWithRates[];
  //   pagination: {
  //     currentPage: number;
  //     totalPages: number;
  //     totalResults: number;
  //     hasNextPage: boolean;
  //     hasPreviousPage: boolean;
  //     resultsPerPage: number;
  //   };
  // }> {
  //   page = page ?? 1;
  //   limit = limit ?? 10;
  //   const resultsPerPage = 10;
  //   const skip = (page - 1) * resultsPerPage;

  //   // Build match stage for inventory based on given parameters
  //   const inventoryMatch: any = { hotelCode };
  //   if (invTypeCode) {
  //     inventoryMatch.invTypeCode = invTypeCode;
  //   }
  //   const startDate = startOfDay(new Date()); // Set to midnight of current day
  //   inventoryMatch["availability.startDate"] = { $gte: startDate };

  //   // UPDATED RATE LOOKUP PIPELINE
  //   const rateLookupPipeline: any[] = [
  //     {
  //       $match: {
  //         $expr: {
  //           $and: [
  //             { $eq: ["$hotelCode", "$$hotelCode"] },
  //             { $eq: ["$invTypeCode", "$$invTypeCode"] },
  //             { $eq: ["$startDate", "$$inventoryStartDate"] }
  //           ]
  //         }
  //       }
  //     }
  //   ];

  //   // Pipeline for counting total results
  //   const countPipeline = [
  //     { $match: inventoryMatch },
  //     {
  //       $lookup: {
  //         from: "rateamountdatewises",
  //         let: {
  //           hotelCode: "$hotelCode",
  //           invTypeCode: "$invTypeCode",
  //           inventoryStartDate: "$availability.startDate"
  //         },
  //         pipeline: rateLookupPipeline,
  //         as: "rates"
  //       }
  //     },
  //     { $count: "total" }
  //   ];

  //   const dataPipeline = [
  //     { $match: inventoryMatch },
  //     {
  //       $lookup: {
  //         from: "rateamountdatewises",
  //         let: {
  //           hotelCode: "$hotelCode",
  //           invTypeCode: "$invTypeCode",
  //           inventoryStartDate: "$availability.startDate"
  //         },
  //         pipeline: rateLookupPipeline,
  //         as: "rates"
  //       }
  //     },
  //     { $skip: skip },
  //     { $limit: resultsPerPage },
  //     {
  //       $project: {
  //         _id: 1,
  //         hotelCode: 1,
  //         hotelName: 1,
  //         invTypeCode: 1,
  //         availability: 1,
  //         rates: {
  //           $cond: {
  //             if: { $gt: [{ $size: "$rates" }, 0] },
  //             then: {
  //               $let: {
  //                 vars: { firstRate: { $arrayElemAt: ["$rates", 0] } },
  //                 in: {
  //                   _id: "$$firstRate._id",
  //                   currencyCode: "$$firstRate.currencyCode",
  //                   ratePlanCode: "$$firstRate.ratePlanCode",
  //                   baseByGuestAmts: {
  //                     $cond: {
  //                       if: { $gt: [{ $size: "$$firstRate.baseByGuestAmts" }, 0] },
  //                       then: { $arrayElemAt: ["$$firstRate.baseByGuestAmts", 0] },
  //                       else: null
  //                     }
  //                   },
  //                 }
  //               }
  //             },
  //             else: null
  //           }
  //         }
  //       }
  //     }
  //   ];

  //   const [countResult, dataResult] = await Promise.all([
  //     Inventory.aggregate(countPipeline),
  //     Inventory.aggregate(dataPipeline)
  //   ]);

  //   const totalResults = countResult[0]?.total || 0;
  //   const totalPages = Math.ceil(totalResults / resultsPerPage);

  //   return {
  //     data: dataResult,
  //     pagination: {
  //       currentPage: page,
  //       totalPages,
  //       totalResults,
  //       hasNextPage: page < totalPages,
  //       hasPreviousPage: page > 1,
  //       resultsPerPage
  //     }
  //   };
  // }

  public static async getRatePlanByHotel(
    hotelCode: string,
    invTypeCode?: string,
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

      console.log("##################### Inside getRatePlanByHotel dao");
      console.log(`hotelCode: ${hotelCode}`);
      console.log(`invTypeCode: ${invTypeCode}`);
      console.log(`page: ${page}`);
      console.log(`limit: ${limit}`);

      const resultsPerPage = limit;
      const skip = (page - 1) * resultsPerPage;

      const [inventory, ratePlans] = await Promise.all([
        this.getInventoryByHotel(hotelCode, invTypeCode),
        this.getRoomRateByHotel(hotelCode, invTypeCode),
      ]);

      const mappedData = this.mapInventoryToRatePlans(inventory, ratePlans);
      if (!mappedData) {
        throw new Error("No mapped data found");
      }
  

      const totalResults = mappedData.length;
      const paginatedData = mappedData.slice(skip, skip + resultsPerPage);
      const totalPages = Math.ceil(totalResults / resultsPerPage);

      return {
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
    } catch (error) {
      throw new Error(`Failed to fetch rate plans: ${error.message}`);
    }
  }

  /**
   * Helper: Get inventory by hotel
   */
  private static async getInventoryByHotel(
    hotelCode: string,
    invTypeCode?: string,
    startDate: Date = endOfDay(new Date()),
    endDate: Date = endOfDay(new Date())
  ) {
    try {

      const inventoryMatch: any = { hotelCode };
      if (invTypeCode) {
        inventoryMatch.invTypeCode = invTypeCode;
      }
      
      inventoryMatch["availability.startDate"] = { $gte: startDate };
      inventoryMatch["availability.endDate"] = { $lte: endDate };
      console.log(`@@@@############### inventoryMatch: ${JSON.stringify(inventoryMatch)}`);

      // Query inventory
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

  private static async getRoomRateByHotel(
    hotelCode: string,
    invTypeCode: string,
    startDate: Date = endOfDay(new Date()),
    endDate: Date = endOfDay(addDays(new Date(), 1)),
  ) {
    try {

      const ratePlanMatch: any = { hotelCode };
      if (invTypeCode) {
        ratePlanMatch.invTypeCode = invTypeCode;
      }
      
      console.log(`@@@@############### ratePlanMatch: ${JSON.stringify(ratePlanMatch)}`);

      ratePlanMatch["startDate"] = { $lte: startDate.toISOString() };
      ratePlanMatch["endDate"] = { $lte: endDate.toISOString() };
      console.log(`@@@@############### ratePlanMatch: ${JSON.stringify(ratePlanMatch)}`);

      const ratePlan = await RateAmount.aggregate([
        { $match: ratePlanMatch },
      ]);

      console.log(`@#@#@#@#@#@#@#@#@ The rate plan we get ${JSON.stringify(ratePlan)}`);

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
    return inventory
      .map((inv) => {

        /**
         * Matching rate plan and inventory according to 
         * @hotelCode 
         * @invTypeCode 
         * @startDate
         */

        const matchingRate = ratePlans.find(
          (rate) =>
            rate.hotelCode === inv.hotelCode &&
            rate.invTypeCode === inv.invTypeCode &&
            rate.startDate.toISOString() === inv.availability.startDate.toISOString()
        );

        if (!matchingRate) return null;

        return {
          _id: inv._id,
          hotelCode: inv.hotelCode,
          hotelName: inv.hotelName,
          invTypeCode: inv.invTypeCode,
          availability: inv.availability,
          rates: {
            _id: matchingRate._id,
            currencyCode: matchingRate.currencyCode,
            ratePlanCode: matchingRate.ratePlanCode,
            baseByGuestAmts:
              matchingRate.baseByGuestAmts.length > 0
                ? matchingRate.baseByGuestAmts[0]
                : null,
          },
        };
      })
      .filter((item): item is RoomWithRates => item !== null);
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