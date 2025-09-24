import { IPromocode, Promocode, PromocodeUsage } from "../model";
import { ThirdPartyBooking } from "../../../wincloud/src/model/reservationModel";
import { Types } from "mongoose";

export interface IPromoCodeRepository {
  code: string;
  propertyId: string;
  propertyCode: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  validFrom: string;
  validTo: string;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  useLimit: number;
  usageLimitPerUser?: number;
  applicableRoomType?: string[];
  applicableRatePlans?: string[];
}

export interface IPromocodeUsageData {
  promoCodeId: Types.ObjectId;
  customerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  discountType: "percentage" | "flat";
  discountValue: number;
  originalAmount: number;
  discountedAmount: number;
  finalAmount: number;
  discountApplied: number;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
  };
}

export interface IUsageStats {
  totalUsage: number;
  successfulUsage: number;
  cancelledUsage: number;
  totalDiscountGiven: number;
  averageDiscount: number;
  utilizationRate: number;
}

export class PromoCodeRepository {

  /**
   * 
   */
  private static instance: PromoCodeRepository;

  /**
   * 
   */
  constructor() { }

  /**
   * 
   */
  static getInstance(): PromoCodeRepository {
    if (!PromoCodeRepository.instance) {
      PromoCodeRepository.instance = new PromoCodeRepository();
    }
    return PromoCodeRepository.instance;
  }

  /**
   * Create a promocode
   * @param promoCodeDetails 
   */
  async createPromoCode(promoCodeDetails: any) {
    try {
      if (!promoCodeDetails) {
        throw new Error("Promocode details are required");
      }

      const createdPromoCode = await Promocode.create(promoCodeDetails);
      return createdPromoCode;

    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error(`Promo code ${promoCodeDetails.code} already exists`);
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      console.error("Error in createPromoCode repository:", error);
      throw error;
    }
  }

  async checkCodeAvailability(code: string): Promise<boolean> {
    try {
      const existingCode = await Promocode.findOne({ code: code });
      return !!existingCode;
    } catch (error) {
      console.error("Error checking code availability:", error);
      throw error;
    }
  }

  /**
   * Get all promocodes
   * @param filters 
   * @param sort 
   * @param skip 
   * @param limit 
   * @returns 
   */
  async getAllPromoCodes(filters: any = {}, sort: any = {}, skip: number = 0, limit: number = 10): Promise<any[]> {
    try {
      const activeFilters = { ...filters, isActive: true };
      return await Promocode.find(activeFilters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('propertyId', 'name code')
        .populate('applicableRoomType', 'roomType roomName')
        .populate('applicableRatePlans', 'ratePlanName code')
        .lean();
    } catch (error) {
      console.error("Error in getAllPromoCodes repository:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Get promocodes count details
   * @param filters 
   * @returns 
   */
  async getPromoCodesCount(filters: any = {}): Promise<number> {
    try {
      return await Promocode.countDocuments(filters);
    } catch (error) {
      console.error("Error in getPromoCodesCount repository:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Update promo code details
   * @param id 
   * @param updateData 
   * @param userId 
   * @returns 
   */
  async updatePromoCode(id: string, updateData: any, userId: string): Promise<any> {
    try {
      if (!id || !updateData) {
        throw new Error("Promo code ID and update data are required");
      }

      const updateObject: any = { ...updateData, updatedAt: new Date() };


      if (updateObject.validFrom) {
        updateObject.validFrom = new Date(updateObject.validFrom);
      }

      if (updateObject.validTo) {
        updateObject.validTo = new Date(updateObject.validTo);
      }


      const existingPromoCode = await Promocode.findOne({ _id: new Types.ObjectId(id) });
      if (!existingPromoCode) {
        throw new Error("Promo code not found");
      }


      if (updateObject.code && updateObject.code !== existingPromoCode.code) {
        const existingCode = await Promocode.findOne({
          code: updateObject.code,
          _id: { $ne: id }
        });

        if (existingCode) {
          throw new Error("Promo code already exists");
        }
      }


      const updatedPromoCode = await Promocode.findByIdAndUpdate(
        id,
        { $set: updateObject },
        {
          new: true,
          runValidators: true
        }
      ).populate('propertyId', 'name code')
        .populate('applicableRoomType', 'roomType roomName')
        .populate('applicableRatePlans', 'ratePlanName code');

      if (!updatedPromoCode) {
        throw new Error("Failed to update promo code");
      }

      return updatedPromoCode;

    } catch (error) {
      console.error("Error in updatePromoCode repository:", error);

      if (error.code === 11000) {
        throw new Error("Promo code already exists");
      }

      throw error;
    }
  }


  /**
   * Hard delete - permanently remove from database
   * @param id 
   * @param userId 
   * @returns 
   */
  async deletePromoCode(id: string, userId: string): Promise<any> {
    try {
      if (!id) {
        throw new Error("Promo code ID is required");
      }

      const existingPromoCode = await Promocode.findById(id);
      if (!existingPromoCode) {
        throw new Error("Promo code not found");
      }

      const deletedPromoCode = await Promocode.findByIdAndDelete(id);

      await this.logDeletionActivity(id, existingPromoCode.code, userId);

      return deletedPromoCode;

    } catch (error) {
      console.error("Error in deletePromoCode repository:", error);
      throw error;
    }
  }

  /**
   * Soft delete - mark as inactive instead of removing
   * @param id 
   * @param userId 
   * @returns 
   */
  async softDeletePromoCode(id: string, userId: string): Promise<any> {
    try {
      if (!id) {
        throw new Error("Promo code ID is required");
      }

      const existingPromoCode = await Promocode.findById(id);
      if (!existingPromoCode) {
        throw new Error("Promo code not found");
      }

      const softDeletedPromoCode = await Promocode.findByIdAndUpdate(
        id,
        {
          $set: {
            isActive: false,
            deletedAt: new Date(),
            deletedBy: userId
          }
        },
        {
          new: true,
          runValidators: true
        }
      ).populate('propertyId', 'name code');

      await this.logSoftDeletionActivity(id, existingPromoCode.code, userId);

      return softDeletedPromoCode;

    } catch (error) {
      console.error("Error in softDeletePromoCode repository:", error);
      throw error;
    }
  }

  /**
   * Optional: Log deletion activities
   * @param promoCodeId 
   * @param code 
   * @param userId 
   */
  private async logDeletionActivity(promoCodeId: string, code: string, userId: string): Promise<void> {
    try {
      console.log(`Promo code deleted - ID: ${promoCodeId}, Code: ${code}, DeletedBy: ${userId}, Time: ${new Date().toISOString()}`);

      // Example: Save to audit collection
      // await AuditLog.create({
      //   action: 'DELETE_PROMO_CODE',
      //   targetId: promoCodeId,
      //   targetType: 'PromoCode',
      //   performedBy: userId,
      //   details: { code },
      //   timestamp: new Date()
      // });

    } catch (error) {
      console.error("Error logging deletion activity:", error);
    }
  }

  private async logSoftDeletionActivity(promoCodeId: string, code: string, userId: string): Promise<void> {
    try {
      console.log(`Promo code soft deleted - ID: ${promoCodeId}, Code: ${code}, DeletedBy: ${userId}, Time: ${new Date().toISOString()}`);
    } catch (error) {
      console.error("Error logging soft deletion activity:", error);
    }
  }

  /**
   * Track promocode usage with transaction
   */
  async trackPromocodeUsage(usageData: IPromocodeUsageData): Promise<any> {
    const session = await Promocode.startSession();
    session.startTransaction();

    try {
      const usageRecord = new PromocodeUsage({
        ...usageData,
        status: "applied",
        usageDate: new Date()
      });

      const updatedPromocode = await Promocode.findByIdAndUpdate(
        usageData.promoCodeId,
        {
          $inc: { currentUsage: 1 },
          $addToSet: { usedBy: usageData.customerId },
          $set: { lastUsedAt: new Date() }
        },
        { session, new: true }
      );

      if (updatedPromocode.currentUsage > updatedPromocode.useLimit) {
        throw new Error("Promocode usage limit exceeded");
      }

      await usageRecord.save({ session });
      await session.commitTransaction();

      return { usageRecord, updatedPromocode };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
  * Cancel/refund promocode usage
  */
  async cancelPromocodeUsage(bookingId: Types.ObjectId, reason: "cancelled" | "expired" = "cancelled"): Promise<any> {
    const session = await Promocode.startSession();
    session.startTransaction();

    try {
      const usageRecord = await PromocodeUsage.findOneAndUpdate(
        { bookingId: bookingId, status: "applied" },
        {
          status: reason,
          $set: {
            updatedAt: new Date(),
            "metadata.cancellationReason": reason
          }
        },
        { session, new: true }
      );

      if (usageRecord) {
        await Promocode.findByIdAndUpdate(
          usageRecord.promoCodeId,
          {
            $inc: { currentUsage: -1 },
            $pull: { usedBy: usageRecord.customerId }
          },
          { session }
        );
      }

      await session.commitTransaction();
      return usageRecord;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get promocode usage statistics
   */
  async getPromocodeUsageStats(promoCodeId: Types.ObjectId): Promise<IUsageStats> {
    const [usageStats, promocode] = await Promise.all([
      PromocodeUsage.aggregate([
        {
          $match: { promoCodeId: promoCodeId }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalDiscount: { $sum: "$discountApplied" },
            avgDiscount: { $avg: "$discountApplied" }
          }
        }
      ]),
      Promocode.findById(promoCodeId)
    ]);

    const statsMap = usageStats.reduce((acc, stat) => {
      acc[stat._id] = stat;
      return acc;
    }, {});

    const totalUsage = (statsMap.applied?.count || 0) + (statsMap.cancelled?.count || 0) + (statsMap.expired?.count || 0);
    const successfulUsage = statsMap.applied?.count || 0;
    const totalDiscountGiven = statsMap.applied?.totalDiscount || 0;

    return {
      totalUsage,
      successfulUsage,
      cancelledUsage: statsMap.cancelled?.count || 0,
      totalDiscountGiven,
      averageDiscount: statsMap.applied?.avgDiscount || 0,
      utilizationRate: promocode ? (successfulUsage / promocode.useLimit) * 100 : 0
    };
  }

  /**
   * Get user's promocode usage history
   */
  async getUserPromocodeUsage(customerId: Types.ObjectId, filters: any = {}): Promise<any[]> {
    return PromocodeUsage.find({
      customerId: customerId,
      ...filters
    })
      .populate("promoCodeId", "code description discountType discountValue")
      .populate("bookingId", "bookingReference checkInDate checkOutDate totalAmount")
      .sort({ usageDate: -1 })
      .lean();
  }

  /**
   * Check if user can use promocode
   */
  async canUserUsePromocode(promoCodeId: Types.ObjectId, customerId: Types.ObjectId): Promise<{ canUse: boolean; reason?: string; userUsageCount?: number }> {
    const [promocode, userUsageCount] = await Promise.all([
      Promocode.findById(promoCodeId),
      PromocodeUsage.countDocuments({
        promoCodeId: promoCodeId,
        customerId: customerId,
        status: "applied"
      })
    ]);

    if (!promocode) {
      return { canUse: false, reason: "Promocode not found" };
    }

    if (promocode.currentUsage >= promocode.useLimit) {
      return { canUse: false, reason: "Promocode usage limit reached" };
    }

    if (promocode.usageLimitPerUser && userUsageCount >= promocode.usageLimitPerUser) {
      return {
        canUse: false,
        reason: "User usage limit reached",
        userUsageCount
      };
    }

    return { canUse: true, userUsageCount };
  }

  /**
   * Get recent promocode usage with pagination
   */
  async getRecentPromocodeUsage(promoCodeId: Types.ObjectId, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const [usageRecords, totalCount] = await Promise.all([
        PromocodeUsage.find({ promoCodeId: promoCodeId })
          .populate("customerId", "name email phone")
          .populate("bookingId", "bookingReference checkInDate checkOutDate totalAmount")
          .sort({ usageDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PromocodeUsage.countDocuments({ promoCodeId: promoCodeId })
      ]);

      return {
        data: usageRecords,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        }
      };

    } catch (error) {
      console.error("Error getting recent promocode usage:", error);
      throw error;
    }
  }

  /**
   * Get promocode analytics for property
   */
  async getPropertyPromocodeAnalytics(propertyId: Types.ObjectId, startDate?: Date, endDate?: Date): Promise<any[]> {
    const matchStage: any = {
      propertyId: propertyId
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    return Promocode.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "promocodeusages",
          localField: "_id",
          foreignField: "promoCodeId",
          as: "usageData"
        }
      },
      {
        $project: {
          code: 1,
          discountType: 1,
          discountValue: 1,
          currentUsage: 1,
          useLimit: 1,
          isActive: 1,
          totalBookings: { $size: "$usageData" },
          successfulUsage: {
            $size: {
              $filter: {
                input: "$usageData",
                as: "usage",
                cond: { $eq: ["$$usage.status", "applied"] }
              }
            }
          },
          totalDiscount: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$usageData",
                    as: "usage",
                    cond: { $eq: ["$$usage.status", "applied"] }
                  }
                },
                as: "usage",
                in: "$$usage.discountApplied"
              }
            }
          },
          utilizationRate: {
            $cond: [
              { $eq: ["$useLimit", 0] },
              0,
              { $multiply: [{ $divide: ["$currentUsage", "$useLimit"] }, 100] }
            ]
          }
        }
      }
    ]);
  }



}
