import { RatePlan as RatePlanType } from "../common/interface/ratePlan.interface";
import RatePlan from "../model/ratePlan.model";
import { RateAmount } from "../../../wincloud/src/model/ratePlanModel"
import { Inventory } from "../../../wincloud/src/model/inventoryModel"
import { startOfDay, endOfDay } from 'date-fns';

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

  public static async updateRatePlan(inventoryId: string, rateAmountId: string, Price: number, availability: number) {

    try {
      let inventoryUpdated = null;
      if (availability !== undefined && inventoryId) {
        inventoryUpdated = await Inventory.findByIdAndUpdate(
          inventoryId,
          { "availability.count": availability },
          { new: true, runValidators: true }
        );

        if (!inventoryUpdated) {
          throw new Error("Inventory not found or update failed");
        }
      }



      if (Price && rateAmountId) {
    const rateUpdated = await RateAmount.findByIdAndUpdate(
        rateAmountId,
        { 
            $set: { 
                "baseByGuestAmts.$[].amountBeforeTax": Price 
            } 
        },
        { new: true, runValidators: true }
    );

    if (!rateUpdated) {
        throw new Error("Rate Amount update failed");
    }

    return {
        rateAmount: rateUpdated,
        message: "Rate plan updated successfully"
    };
} else {
    throw new Error("Price or rateAmountId not provided");
}




    } catch (error) {
      console.error("Error updating rate plan:", error);
      throw error;
    }
  }

  /**
   * Get available rooms with their corresponding rates using aggregation pipeline
   */
  public static async getRatePlanByHotelCode(
    hotelCode: string,
    invTypeCode?: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1
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
    const resultsPerPage = 20;
    const skip = (page - 1) * resultsPerPage;

    // Build match stage for inventory
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

    // Build lookup pipeline for rates
    const rateLookupPipeline: any[] = [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$hotelCode", "$$hotelCode"] },
              { $eq: ["$invTypeCode", "$$invTypeCode"] },
            ]
          }
        }
      }
    ];

    if (startDate && endDate) {
      const start = startOfDay(startDate);
      const end = endOfDay(endDate);

      rateLookupPipeline[0].$match.$expr.$and.push({
        $or: [
          {
            $and: [
              { $gte: ["$startDate", start] },
              { $lte: ["$startDate", end] }
            ]
          },
          {
            $and: [
              { $gte: ["$endDate", start] },
              { $lte: ["$endDate", end] }
            ]
          },
          {
            $and: [
              { $lte: ["$startDate", start] },
              { $gte: ["$endDate", end] }
            ]
          }
        ]
      });
    }

    // Pipeline for counting total results
    const countPipeline = [
      {
        $match: inventoryMatch
      },
      {
        $lookup: {
          from: "rateamounts",
          let: {
            hotelCode: "$hotelCode",
            invTypeCode: "$invTypeCode"
          },
          pipeline: rateLookupPipeline,
          as: "rates"
        }
      },
      {
        $count: "total"
      }
    ];

    // Pipeline for fetching paginated data
    const dataPipeline = [
      // Match available inventory
      {
        $match: inventoryMatch
      },

      // Lookup corresponding rates
      {
        $lookup: {
          from: "rateamounts",
          let: {
            hotelCode: "$hotelCode",
            invTypeCode: "$invTypeCode"
          },
          pipeline: rateLookupPipeline,
          as: "rates"
        }
      },

      // Skip for pagination
      {
        $skip: skip
      },

      // Limit results per page
      {
        $limit: resultsPerPage
      },
      {
        $project: {
          _id: 1,
          hotelCode: 1,
          hotelName: 1,
          invTypeCode: 1,
          availability: 1,
          rates: {
            $cond: {
              if: { $gt: [{ $size: "$rates" }, 0] },
              then: {
                currencyCode: { $arrayElemAt: ["$rates.currencyCode", 0] },
                baseByGuestAmts: {
                  $arrayElemAt: [
                    { $arrayElemAt: ["$rates.baseByGuestAmts", 0] },
                    0
                  ]
                }
              },
              else: null
            }
          }
        }
      }
    ];

    // Execute both pipelines concurrently
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


}

export { RatePlanDao };