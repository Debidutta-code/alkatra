import { RatePlan, RatePlan as RatePlanType } from "../common/interface/ratePlan.interface";
import { RatePlanDao } from "../dao/ratePlan.dao";
interface UpdateplanData {
  availability: number;
  price: number;
  rateAmountId: string;
}
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

  public static async updateRatePlan(inventoryId: string, ratePlanData: UpdateplanData) {
    // Optional: Add validation or preprocessing here if needed
    const { availability, price, rateAmountId } = ratePlanData
    if (!availability || !price || !rateAmountId) {
      return {
        success: false,
        message: "provide all the necessary fields"
      }
    }
    const updatedRatePlan = await RatePlanDao.updateRatePlan(inventoryId, rateAmountId, price, availability);
    return {
      success: true,
      message: "Rate plan updated successfully",
      data: updatedRatePlan,
    };
  }


  public static async getRatePlanByHotelCode(hotelCode: string, invTypeCode?: string, startDate?: Date, endDate?: Date, page?: number) {
    const ratePlans = await RatePlanDao.getRatePlanByHotelCode(hotelCode, invTypeCode && invTypeCode, startDate && startDate, endDate && endDate, page && page);

    return {
      success: true,
      message: "Rate plans retrieved successfully",
      data: ratePlans,
    };
  }

}

export { RatePlanService };
