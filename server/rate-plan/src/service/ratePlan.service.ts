import { RatePlan, RatePlan as RatePlanType } from "../common/interface/ratePlan.interface";
import { RatePlanDao } from "../dao/ratePlan.dao";

class RatePlanService {
  public static async createRatePlan(ratePlanData: any) {
    // Extract scheduling fields
    const {
      type,
      weeklyDays,
      dateRanges,
      availableSpecificDates,
      ...rest
    } = ratePlanData;

    const finalRatePlanData: RatePlanType = {
      ...rest,
      scheduling: {
        type,
        weeklyDays,
        dateRanges,
        availableSpecificDates
      }
    };

    console.log("finalRatePlanData", finalRatePlanData);

    const savedRatePlan = await RatePlanDao.create(finalRatePlanData);

    return {
      success: true,
      message: "Rate plan created successfully",
      data: savedRatePlan
    };
  }

  public static async updateRatePlan(id: string, ratePlanData: Partial<RatePlan>) {
    // Optional: Add validation or preprocessing here if needed
    const updatedRatePlan = await RatePlanDao.updateRatePlan(id, ratePlanData);
    return {
      success: true,
      message: "Rate plan updated successfully",
      data: updatedRatePlan,
    };
  }


  public static async getRatePlanByHotelCode(hotelCode: string) {
    const ratePlans = await RatePlanDao.getRatePlanByHotelCode(hotelCode);

    if (ratePlans.length === 0) throw new Error("No rate plans found for this hotel code");

    return {
      success: true,
      message: "Rate plans retrieved successfully",
      data: ratePlans,
    };
  }

}

export { RatePlanService };
