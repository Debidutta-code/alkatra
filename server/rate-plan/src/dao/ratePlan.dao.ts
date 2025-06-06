import { RatePlan as RatePlanType } from "../common/interface/ratePlan.interface";
import RatePlan from "../model/ratePlan.model";
import  RateAmount  from "../../../wincloud/src/model/ratePlanDateWise.model"
import { Inventory } from "../../../wincloud/src/model/inventoryModel"
import { startOfDay, endOfDay } from 'date-fns';
interface UpdatePlanData {
  rateAmountId:string;
  inventoryId:string;
  price:number;
  availability:number;
}
interface RoomWithRates {
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  availability: {
    startDate: Date;
    endDate: Date;
    count: number;
  };
  rates: Array<{
    ratePlanCode: string;
    startDate: Date;
    endDate: Date;
    days: {
      mon: boolean;
      tue: boolean;
      wed: boolean;
      thu: boolean;
      fri: boolean;
      sat: boolean;
      sun: boolean;
    };
    currencyCode: string;
    baseByGuestAmts: Array<{
      amountBeforeTax: number;
      numberOfGuests: number;
    }>;
    additionalGuestAmounts: Array<{
      ageQualifyingCode: string;
      amount: number;
    }>;
  }>;
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
  public static async updateRatePlan(ratePlansData:UpdatePlanData[]) {
   try {
    // Validate input
    if (!Array.isArray(ratePlansData) || ratePlansData.length === 0) {
      throw new Error("ratePlansData must be a non-empty array");
    }
    // Create update promises for each rate plan
    const updatePromises = ratePlansData.map(async (planData, index) => {
      const { rateAmountId, inventoryId, price, availability } = planData;
      let inventoryUpdated = null;
      let rateUpdated = null;
      // Update inventory if availability is provided
      if (availability !== undefined && inventoryId) {
        inventoryUpdated = await Inventory.findByIdAndUpdate(
          inventoryId,
          { "availability.count": availability },
          { new: true, runValidators: true }
        );
        if (!inventoryUpdated) {
          throw new Error(`Inventory not found or update failed for inventoryId: ${inventoryId}`);
        }
      }
      // Update rate amount if price is provided
      if (price !== undefined && rateAmountId) {
        console.log("rate amount",rateAmountId)
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
      // Validate that at least one update was requested
      if (price === undefined && availability === undefined) {
        throw new Error(`No update data provided for index ${index}`);
      }
      return {
        index,
        rateAmountId,
        inventoryId,
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
public static async getRatePlanByHotel(
  hotelCode: string,
  invTypeCode?: string,
  startDate?: Date,
  endDate?: Date,
  page?: number
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
  page = page ?? 1;
  const resultsPerPage = 20;
  const skip = (page - 1) * resultsPerPage;
  // Build match stage for inventory based on given parameters
  const inventoryMatch: any = { hotelCode };
  if (invTypeCode) {
    inventoryMatch.invTypeCode = invTypeCode;
  }
  if (startDate && endDate) {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    inventoryMatch.$or = [
      { "availability.startDate": { $gte: start, $lte: end } },
      { "availability.endDate": { $gte: start, $lte: end } },
      {
        $and: [
          { "availability.startDate": { $lte: start } },
          { "availability.endDate": { $gte: end } }
        ]
      }
    ];
  }
  // UPDATED RATE LOOKUP PIPELINE
  // Simplified to match exact start dates
  const rateLookupPipeline: any[] = [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ["$hotelCode", "$$hotelCode"] },
            { $eq: ["$invTypeCode", "$$invTypeCode"] },
            // Match exact start date instead of range overlap
            { $eq: ["$startDate", "$$inventoryStartDate"] }
          ]
        }
      }
    }
  ];
  // Pipeline for counting total results
  const countPipeline = [
    { $match: inventoryMatch },
    {
      $lookup: {
        from: "rateamountdatewises",
        let: {
          hotelCode: "$hotelCode",
          invTypeCode: "$invTypeCode",
          inventoryStartDate: "$availability.startDate"
        },
        pipeline: rateLookupPipeline,
        as: "rates"
      }
    },
    { $count: "total" }
  ];
  // ... existing code ...
// Pipeline for fetching paginated data
const dataPipeline = [
  { $match: inventoryMatch },
  {
    $lookup: {
      from: "rateamountdatewises",
      let: {
        hotelCode: "$hotelCode",
        invTypeCode: "$invTypeCode",
        inventoryStartDate: "$availability.startDate"
      },
      pipeline: rateLookupPipeline,
      as: "rates"
    }
  },
  { $skip: skip },
  { $limit: resultsPerPage },
  {
    $project: {
      _id: 1,
      hotelCode: 1,
      hotelName: 1,
      invTypeCode: 1,
      availability: 1,
      // CHANGED: Convert rates array to single object
      rates: {
        $cond: {
          if: { $gt: [{ $size: "$rates" }, 0] },
          then: {
            $let: {
              vars: { firstRate: { $arrayElemAt: ["$rates", 0] } },
              in: {
                _id: "$$firstRate._id",
                currencyCode: "$$firstRate.currencyCode",
                // Preserve the baseByGuestAmts structure
                baseByGuestAmts: {
                  $cond: {
                    if: { $gt: [{ $size: "$$firstRate.baseByGuestAmts" }, 0] },
                    then: { $arrayElemAt: ["$$firstRate.baseByGuestAmts", 0] },
                    else: null
                  }
                },
              }
            }
          },
          else: null
        }
      }
    }
  }
];
// ... rest of the code remains the same ...
  const [countResult, dataResult] = await Promise.all([
    Inventory.aggregate(countPipeline),
    Inventory.aggregate(dataPipeline)
  ]);
  const totalResults = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  return {
    data: dataResult,
    pagination: {
      currentPage: page,
      totalPages,
      totalResults,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      resultsPerPage
    }
  };
}
  public static async getAllRoomType() {
    try {
      const response = await Inventory.distinct("invTypeCode");
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