import { IPromocode, Promocode } from "../model";
import { ThirdPartyBooking } from "../../../wincloud/src/model/reservationModel";

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
      return await Promocode.find(filters)
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


      const existingPromoCode = await Promocode.findById(id);
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
}
