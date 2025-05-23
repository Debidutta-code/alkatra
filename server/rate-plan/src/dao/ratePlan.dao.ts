import { RatePlan as RatePlanType } from "../common/interface/ratePlan.interface";
import RatePlan from "../model/ratePlan.model";

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

  public static async updateRatePlan(id: string, data: any) {
    const updated = await RatePlan.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new Error("Rate Plan not found or update failed");
    }

    return updated;
  }

  public static async getRatePlanByHotelCode(hotelCode: string) {
    return await RatePlan.find({ hotelCode });
  }

}

export { RatePlanDao };
