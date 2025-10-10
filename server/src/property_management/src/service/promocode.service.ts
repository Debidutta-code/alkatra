import { PromoCodeRepository } from "../repositories";
import { IPromocode, Promocode, PromocodeUsage } from "../model";
import { IPromoCodeRepository } from "../repositories";
import { generateUniquePromoCode } from "../utils";
import mongoose, { Types } from "mongoose";

interface FilterOptions {
  page: number;
  limit: number;
  filters: any;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PaginatedResponse {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UpdatePromoCodeRequest {
  code?: string;
  description?: string;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  validFrom?: string;
  validTo?: string;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  useLimit?: number;
  usageLimitPerUser?: number;
  applicableRoomType?: string[];
  applicableRatePlans?: string[];
  isActive?: boolean;
}


export class PromoCodeService {

  /**
   * 
   */
  private static instance: PromoCodeService;

  private promoCodeRepository = PromoCodeRepository.getInstance();

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.promoCodeRepository = PromoCodeRepository.getInstance();
  }

  /**
   * 
   */
  static getInstance(): PromoCodeService {
    if (!PromoCodeService.instance) {
      PromoCodeService.instance = new PromoCodeService();
    }
    return PromoCodeService.instance;
  }

  async createPromoCode(promoCodeCreateRequest: IPromoCodeRepository, userId: string) {
    try {
      if (!promoCodeCreateRequest || !userId) {
        throw new Error("Promocode details and User ID are required");
      }

      const requiredFields = ['propertyId', 'propertyCode', 'discountType', 'discountValue', 'validFrom', 'validTo', 'useLimit'];
      for (const field of requiredFields) {
        if (!promoCodeCreateRequest[field as keyof IPromoCodeRepository]) {
          throw new Error(`${field} is required`);
        }
      }

      const uniquePromoCode = await generateUniquePromoCode();

      const existingCode = await this.promoCodeRepository.checkCodeAvailability(uniquePromoCode);
      if (existingCode) {
        const uniquePromoCode = await generateUniquePromoCode();
      }

      const promoCodeData = {
        ...promoCodeCreateRequest,
        code: uniquePromoCode,
        userId: userId
      };

      const createdPromoCode = await this.promoCodeRepository.createPromoCode(promoCodeData);
      return createdPromoCode;

    } catch (error) {
      console.error("Error in createPromoCode service:", error);
      throw new Error(`Failed to create promo code: ${error.message}`);
    }
  }

  async getAllPromoCode(filterOptions: FilterOptions): Promise<PaginatedResponse> {
    try {
      const { page, limit, filters, sortBy, sortOrder } = filterOptions;

      const skip = (page - 1) * limit;
      const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [promoCodes, totalCount] = await Promise.all([
        this.promoCodeRepository.getAllPromoCodes(filters, sort, skip, limit),
        this.promoCodeRepository.getPromoCodesCount(filters)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: promoCodes,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };

    } catch (error) {
      console.error("Error in getAllPromoCode service:", error);
      throw new Error(`Failed to fetch promo codes: ${error.message}`);
    }
  }

  async updatePromoCode(id: string, updateData: UpdatePromoCodeRequest, userId: string): Promise<any> {
    try {
      if (!id || !updateData || !userId) {
        throw new Error("Promo code ID, update data, and user ID are required");
      }

      this.validateUpdateData(updateData);

      const updatedPromoCode = await this.promoCodeRepository.updatePromoCode(id, updateData, userId);

      if (!updatedPromoCode) {
        throw new Error("Promo code not found");
      }

      return updatedPromoCode;

    } catch (error) {
      console.error("Error in updatePromoCode service:", error);
      throw error;
    }
  }

  private validateUpdateData(updateData: UpdatePromoCodeRequest): void {

    if (updateData.discountType && !['percentage', 'flat'].includes(updateData.discountType)) {
      throw new Error("Discount type must be either 'percentage' or 'flat'");
    }

    if (updateData.discountValue !== undefined) {
      if (typeof updateData.discountValue !== 'number' || updateData.discountValue < 0) {
        throw new Error("Discount value must be a positive number");
      }

      if (updateData.discountType === 'percentage' && updateData.discountValue > 100) {
        throw new Error("Percentage discount cannot exceed 100%");
      }
    }


    if (updateData.validFrom || updateData.validTo) {
      const validFrom = updateData.validFrom ? new Date(updateData.validFrom) : null;
      const validTo = updateData.validTo ? new Date(updateData.validTo) : null;

      if (validFrom && isNaN(validFrom.getTime())) {
        throw new Error("Invalid validFrom date format");
      }

      if (validTo && isNaN(validTo.getTime())) {
        throw new Error("Invalid validTo date format");
      }

      if (validFrom && validTo && validFrom >= validTo) {
        throw new Error("validFrom must be before validTo");
      }
    }


    const numericFields = ['minBookingAmount', 'maxDiscountAmount', 'useLimit', 'usageLimitPerUser'];
    for (const field of numericFields) {
      if (updateData[field as keyof UpdatePromoCodeRequest] !== undefined) {
        const value = updateData[field as keyof UpdatePromoCodeRequest];
        if (typeof value !== 'number' || value < 0) {
          throw new Error(`${field} must be a positive number`);
        }
      }
    }
  }

  async deletePromoCode(id: string, userId: string): Promise<any> {
    try {
      if (!id || !userId) {
        throw new Error("Promo code ID and user ID are required");
      }

      const deletedPromoCode = await this.promoCodeRepository.deletePromoCode(id, userId);

      if (!deletedPromoCode) {
        throw new Error("Promo code not found");
      }

      return deletedPromoCode;

    } catch (error) {
      console.error("Error in deletePromoCode service:", error);
      throw error;
    }
  }

  /**
   * Optional: Soft delete service method
   * @param id 
   * @param userId 
   * @returns 
   */
  async softDeletePromoCode(id: string, userId: string): Promise<any> {
    try {
      if (!id || !userId) {
        throw new Error("Promo code ID and user ID are required");
      }

      const updatedPromoCode = await this.promoCodeRepository.softDeletePromoCode(id, userId);

      if (!updatedPromoCode) {
        throw new Error("Promo code not found");
      }

      return updatedPromoCode;

    } catch (error) {
      console.error("Error in softDeletePromoCode service:", error);
      throw error;
    }
  }

  /**
   * Track promocode usage
   */
  async trackPromocodeUsage(usageData: {
    promoCodeId: string;
    customerId: string;
    bookingId: string;
    discountType: "percentage" | "flat";
    discountValue: number;
    originalAmount: number;
    discountedAmount: number;
    finalAmount: number;
    discountApplied: number;
    metadata?: any;
  }): Promise<any> {
    try {

      this.validateUsageData(usageData);

      const usageDataWithObjectIds = {
        ...usageData,
        promoCodeId: new Types.ObjectId(usageData.promoCodeId),
        customerId: new Types.ObjectId(usageData.customerId),
        bookingId: new Types.ObjectId(usageData.bookingId)
      };

      const result = await this.promoCodeRepository.trackPromocodeUsage(usageDataWithObjectIds);


      console.log(`Promocode usage tracked: ${usageData.promoCodeId} for booking ${usageData.bookingId}`);

      return result;

    } catch (error) {
      console.error("Error tracking promocode usage:", error);
      throw new Error(`Failed to track promocode usage: ${error.message}`);
    }
  }

  /**
   * Validate usage data
   */
  private validateUsageData(usageData: any): void {
    const requiredFields = [
      'promoCodeId', 'customerId', 'bookingId', 'discountType',
      'discountValue', 'originalAmount', 'discountedAmount',
      'finalAmount', 'discountApplied'
    ];

    for (const field of requiredFields) {
      if (!usageData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (usageData.originalAmount < usageData.finalAmount) {
      throw new Error("Final amount cannot be greater than original amount");
    }

    if (usageData.discountApplied < 0) {
      throw new Error("Discount applied cannot be negative");
    }
  }

  /**
   * Cancel promocode usage (for booking cancellations)
   */
  async cancelPromocodeUsage(bookingId: string, reason: "cancelled" | "expired" = "cancelled"): Promise<any> {
    try {
      if (!bookingId) {
        throw new Error("Booking ID is required");
      }

      const result = await this.promoCodeRepository.cancelPromocodeUsage(
        new Types.ObjectId(bookingId),
        reason
      );

      if (!result) {
        throw new Error("No promocode usage found for this booking");
      }

      console.log(`Promocode usage cancelled for booking: ${bookingId}, reason: ${reason}`);

      return result;

    } catch (error) {
      console.error("Error cancelling promocode usage:", error);
      throw new Error(`Failed to cancel promocode usage: ${error.message}`);
    }
  }

  /**
   * Validate promocode before applyintg
   */
  async validatePromocodeForUse(
    code: string,
    customerId: string,
    bookingAmount: number,
    property: { propertyCode?: string; propertyId?: string }
  ): Promise<{
    isValid: boolean;
    promocode?: any;
    discountAmount?: number;
    finalAmount?: number;
    message?: string;
  }> {
    try {
      const query: any = {
        code: code,
        isActive: true
      };

      if (property.propertyId) {
        query.propertyId = new Types.ObjectId(property.propertyId);
      } else if (property.propertyCode) {
        query.propertyCode = property.propertyCode;
      }

      const promocode = await Promocode.findOne(query);

      if (!promocode) {
        return { isValid: false, message: "Invalid promocode" };
      }

      const now = new Date();
      if (now < promocode.validFrom) {
        return { isValid: false, message: "Promocode is not yet valid" };
      }

      if (now > promocode.validTo) {
        return { isValid: false, message: "Promocode has expired" };
      }

      if (promocode.minBookingAmount && bookingAmount < promocode.minBookingAmount) {
        return {
          isValid: false,
          message: `Minimum booking amount of ${promocode.minBookingAmount} required`
        };
      }

      // Check usage limits
      if (promocode.currentUsage >= promocode.useLimit) {
        return { isValid: false, message: "Promocode usage limit reached" };
      }

      const usageCheck = await this.promoCodeRepository.canUserUsePromocode(
        promocode._id,
        new Types.ObjectId(customerId)
      );

      if (!usageCheck.canUse) {
        return { isValid: false, message: usageCheck.reason };
      }

      const discountAmount = this.calculateDiscount(promocode, bookingAmount);
      const finalAmount = bookingAmount - discountAmount;

      return {
        isValid: true,
        promocode,
        discountAmount,
        finalAmount,
        message: "Promocode is valid"
      };

    } catch (error) {
      console.error("Error validating promocode:", error);
      return { isValid: false, message: "Error validating promocode" };
    }
  }

  // Add this method to your service for applying promocode
  // async applyPromocode(
  //   code: string,
  //   customerId: string,
  //   bookingId: string,
  //   bookingAmount: number,
  //   property: { propertyCode?: string; propertyId?: string }
  // ): Promise<{ success: boolean; message: string; discountAmount?: number }> {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  //   try {
  //     // First validate the promocode
  //     const validationResult = await this.validatePromocodeForUse(
  //       code,
  //       customerId,
  //       bookingAmount,
  //       property
  //     );

  //     if (!validationResult.isValid || !validationResult.promocode) {
  //       return { success: false, message: validationResult.message || "Invalid promocode" };
  //     }

  //     const promocode = validationResult.promocode;
  //     const discountAmount = validationResult.discountAmount || 0;

  //     // Update promocode usage
  //     const updatedPromocode = await Promocode.findByIdAndUpdate(
  //       promocode._id,
  //       {
  //         $inc: { currentUsage: 1 },
  //         $addToSet: { usedBy: new Types.ObjectId(customerId) },
  //         $set: { lastUsedAt: new Date() }
  //       },
  //       { session, new: true }
  //     );

  //     if (!updatedPromocode) {
  //       await session.abortTransaction();
  //       return { success: false, message: "Failed to update promocode usage" };
  //     }

  //     // Create promocode usage record
  //     const promocodeUsage = new PromocodeUsage({
  //       promoCodeId: promocode._id,
  //       customerId: new Types.ObjectId(customerId),
  //       bookingId: new Types.ObjectId(bookingId),
  //       discountType: promocode.discountType,
  //       discountValue: promocode.discountValue,
  //       originalAmount: bookingAmount,
  //       discountedAmount: bookingAmount - discountAmount,
  //       finalAmount: bookingAmount - discountAmount,
  //       discountApplied: discountAmount,
  //       usageDate: new Date(),
  //       status: "applied"
  //     });

  //     await promocodeUsage.save({ session });

  //     await session.commitTransaction();

  //     return {
  //       success: true,
  //       message: "Promocode applied successfully",
  //       discountAmount
  //     };

  //   } catch (error) {
  //     await session.abortTransaction();
  //     console.error("Error applying promocode:", error);
  //     return { success: false, message: "Error applying promocode" };
  //   } finally {
  //     await session.endSession();
  //   }
  // }

  async applyPromocode(
    code: string,
    customerId: string,
    bookingAmount: number,
    property: { propertyCode?: string; propertyId?: string }
  ): Promise<{ success: boolean; message: string; discountAmount?: number }> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // First validate the promocode
      const validationResult = await this.validatePromocodeForUse(
        code,
        customerId,
        bookingAmount,
        property
      );

      console.log("The validation details:", validationResult);

      if (!validationResult.isValid || !validationResult.promocode) {
        await session.abortTransaction();
        return { success: false, message: validationResult.message || "Invalid promocode" };
      }

      const promocode = validationResult.promocode;
      const discountAmount = validationResult.discountAmount || 0;

      console.log(`Applying promocode ${code}. Current usage: ${promocode.currentUsage}`);

      // Update promocode usage - THIS INCREASES THE COUNTER
      const updatedPromocode = await Promocode.findByIdAndUpdate(
        promocode._id,
        {
          $inc: { currentUsage: 1 }, // THIS IS WHAT INCREASES USAGE
          $addToSet: { usedBy: new Types.ObjectId(customerId) },
          $set: { lastUsedAt: new Date() }
        },
        { session, new: true }
      );

      if (!updatedPromocode) {
        await session.abortTransaction();
        return { success: false, message: "Failed to update promocode usage" };
      }

      console.log(`Promocode usage updated to: ${updatedPromocode.currentUsage}`);

      // Create promocode usage record
      const promocodeUsage = new PromocodeUsage({
        promoCodeId: promocode._id,
        customerId: new Types.ObjectId(customerId),
        discountType: promocode.discountType,
        discountValue: promocode.discountValue,
        originalAmount: bookingAmount,
        discountedAmount: bookingAmount - discountAmount,
        finalAmount: bookingAmount - discountAmount,
        discountApplied: discountAmount,
        usageDate: new Date(),
        status: "applied"
      });

      await promocodeUsage.save({ session });

      await session.commitTransaction();

      console.log(`✅ Promocode ${code} APPLIED successfully. New usage: ${updatedPromocode.currentUsage}`);

      return {
        success: true,
        message: "Promocode applied successfully",
        discountAmount
      };

    } catch (error: any) {
      await session.abortTransaction();
      console.error("❌ Error applying promocode:", error);
      return { success: false, message: "Error applying promocode: " + error.message };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(promocode: any, bookingAmount: number): number {
    let discount = 0;

    if (promocode.discountType === "percentage") {
      discount = (bookingAmount * promocode.discountValue) / 100;

      if (promocode.maxDiscountAmount && discount > promocode.maxDiscountAmount) {
        discount = promocode.maxDiscountAmount;
      }
    } else {
      discount = promocode.discountValue;
    }

    return Math.min(discount, bookingAmount);
  }


  /**
   * Get promocode usage statistics
   */
  async getPromocodeUsageStats(promoCodeId: string): Promise<any> {
    try {
      if (!promoCodeId) {
        throw new Error("Promocode ID is required");
      }

      return await this.promoCodeRepository.getPromocodeUsageStats(
        new Types.ObjectId(promoCodeId)
      );

    } catch (error) {
      console.error("Error getting promocode usage stats:", error);
      throw new Error(`Failed to get usage statistics: ${error.message}`);
    }
  }

  /**
   * Get user's promocode usage history
   */
  async getUserPromocodeHistory(customerId: string, filters: any = {}): Promise<any[]> {
    try {
      if (!customerId) {
        throw new Error("Customer ID is required");
      }

      return await this.promoCodeRepository.getUserPromocodeUsage(
        new Types.ObjectId(customerId),
        filters
      );

    } catch (error) {
      console.error("Error getting user promocode history:", error);
      throw new Error(`Failed to get user history: ${error.message}`);
    }
  }

  /**
   * Get property promocode analytics
   */
  async getPropertyPromocodeAnalytics(propertyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      if (!propertyId) {
        throw new Error("Property ID is required");
      }

      return await this.promoCodeRepository.getPropertyPromocodeAnalytics(
        new Types.ObjectId(propertyId),
        startDate,
        endDate
      );

    } catch (error) {
      console.error("Error getting property promocode analytics:", error);
      throw new Error(`Failed to get property analytics: ${error.message}`);
    }
  }

  /**
   * User usage tracker method
   */
  async userUsageTracker(customerId: string, promocodeId?: string, filters: any = {}): Promise<any> {
    try {

      const queryFilters: any = {
        customerId: new Types.ObjectId(customerId),
        ...filters
      };


      if (promocodeId) {
        queryFilters.promoCodeId = new Types.ObjectId(promocodeId);
      }


      if (filters.startDate || filters.endDate) {
        queryFilters.usageDate = {};
        if (filters.startDate) {
          queryFilters.usageDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          queryFilters.usageDate.$lte = new Date(filters.endDate);
        }
      }


      const { startDate, endDate, ...remainingFilters } = filters;
      Object.assign(queryFilters, remainingFilters);

      const usageHistory = await this.promoCodeRepository.getUserPromocodeUsage(
        new Types.ObjectId(customerId),
        queryFilters
      );


      const summary = usageHistory.reduce((acc, usage) => {
        if (usage.status === 'applied') {
          acc.totalDiscount += usage.discountApplied;
          acc.totalBookings++;
          acc.totalSavings += usage.discountApplied;
        }


        acc.statusCounts[usage.status] = (acc.statusCounts[usage.status] || 0) + 1;

        return acc;
      }, {
        totalDiscount: 0,
        totalBookings: 0,
        totalSavings: 0,
        statusCounts: {}
      });


      const successfulUsage = usageHistory.filter(usage => usage.status === 'applied');
      const averageDiscount = successfulUsage.length > 0
        ? summary.totalDiscount / successfulUsage.length
        : 0;

      return {
        usageHistory,
        summary: {
          ...summary,
          totalUsage: usageHistory.length,
          successfulUsage: successfulUsage.length,
          cancelledUsage: summary.statusCounts.cancelled || 0,
          expiredUsage: summary.statusCounts.expired || 0,
          averageDiscount: Math.round(averageDiscount * 100) / 100,
          utilizationRate: successfulUsage.length > 0 ? (successfulUsage.length / usageHistory.length) * 100 : 0
        },
        filtersUsed: {
          customerId,
          promocodeId,
          dateRange: filters.startDate && filters.endDate ?
            `${filters.startDate} to ${filters.endDate}` : 'All time'
        }
      };

    } catch (error) {
      console.error("Error in userUsageTracker:", error);
      throw new Error(`Failed to track user usage: ${error.message}`);
    }
  }

  async getPromocodeById(promoCodeId: string): Promise<any> {
    try {
      if (!promoCodeId) {
        throw new Error("Promocode ID is required");
      }

      const promocode = await Promocode.findById(promoCodeId)
        .populate('propertyId', 'name code')
        .populate('applicableRoomType', 'roomType roomName')
        .populate('applicableRatePlans', 'ratePlanName code')
        .lean();

      if (!promocode) {
        throw new Error("Promocode not found");
      }

      return promocode;

    } catch (error) {
      console.error("Error getting promocode by ID:", error);
      throw new Error(`Failed to get promocode: ${error.message}`);
    }
  }

  /**
   * Get recent usage for a specific promocode with pagination
   */
  async getPromocodeRecentUsage(promoCodeId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      if (!promoCodeId) {
        throw new Error("Promocode ID is required");
      }

      const result = await this.promoCodeRepository.getRecentPromocodeUsage(
        new Types.ObjectId(promoCodeId),
        page,
        limit
      );

      return result;

    } catch (error) {
      console.error("Error getting promocode recent usage:", error);
      throw new Error(`Failed to get recent usage: ${error.message}`);
    }
  }

  /**
   * Check if user is eligible to use a promocode
   */
  async checkUserPromocodeEligibility(promoCodeId: string, customerId: string): Promise<{
    eligible: boolean;
    reasons: string[];
    userUsageCount?: number;
    promocode?: any;
    limits?: {
      totalUsage: number;
      useLimit: number;
      userUsageCount: number;
      usageLimitPerUser?: number;
    };
  }> {
    try {
      if (!promoCodeId || !customerId) {
        throw new Error("Promocode ID and customer ID are required");
      }

      const promocode = await this.getPromocodeById(promoCodeId);
      if (!promocode) {
        return {
          eligible: false,
          reasons: ["Promocode not found"],
        };
      }

      const reasons: string[] = [];


      if (!promocode.isActive) {
        reasons.push("Promocode is not active");
      }


      const now = new Date();
      if (now < promocode.validFrom) {
        reasons.push("Promocode is not yet valid");
      }

      if (now > promocode.validTo) {
        reasons.push("Promocode has expired");
      }


      if (promocode.currentUsage >= promocode.useLimit) {
        reasons.push("Promocode usage limit has been reached");
      }


      const usageCheck = await this.promoCodeRepository.canUserUsePromocode(
        new Types.ObjectId(promoCodeId),
        new Types.ObjectId(customerId)
      );

      if (!usageCheck.canUse && usageCheck.reason) {
        reasons.push(usageCheck.reason);
      }

      const eligible = reasons.length === 0;

      return {
        eligible,
        reasons: eligible ? ["User is eligible to use this promocode"] : reasons,
        userUsageCount: usageCheck.userUsageCount,
        promocode: eligible ? promocode : undefined,
        limits: {
          totalUsage: promocode.currentUsage,
          useLimit: promocode.useLimit,
          userUsageCount: usageCheck.userUsageCount || 0,
          usageLimitPerUser: promocode.usageLimitPerUser
        }
      };

    } catch (error) {
      console.error("Error checking user promocode eligibility:", error);
      throw new Error(`Failed to check eligibility: ${error.message}`);
    }
  }

  /**
   * Get multiple promocodes by IDs (bulk operation)
   */
  async getPromocodesByIds(promoCodeIds: string[]): Promise<any[]> {
    try {
      if (!promoCodeIds || !Array.isArray(promoCodeIds)) {
        throw new Error("Array of promocode IDs is required");
      }

      const objectIds = promoCodeIds.map(id => new Types.ObjectId(id));

      const promocodes = await Promocode.find({
        _id: { $in: objectIds }
      })
        .populate('propertyId', 'name code')
        .populate('applicableRoomType', 'roomType roomName')
        .populate('applicableRatePlans', 'ratePlanName code')
        .lean();

      return promocodes;

    } catch (error) {
      console.error("Error getting promocodes by IDs:", error);
      throw new Error(`Failed to get promocodes: ${error.message}`);
    }
  }

  /**
   * Search promocodes with advanced filtering
   */
  async searchPromocodes(searchCriteria: {
    propertyId?: string;
    code?: string;
    discountType?: "percentage" | "flat";
    isActive?: boolean;
    minDiscountValue?: number;
    maxDiscountValue?: number;
    validAfter?: Date;
    validBefore?: Date;
  }): Promise<any[]> {
    try {
      const filter: any = {};

      if (searchCriteria.propertyId) {
        filter.propertyId = new Types.ObjectId(searchCriteria.propertyId);
      }

      if (searchCriteria.code) {
        filter.code = { $regex: searchCriteria.code, $options: 'i' };
      }

      if (searchCriteria.discountType) {
        filter.discountType = searchCriteria.discountType;
      }

      if (searchCriteria.isActive !== undefined) {
        filter.isActive = searchCriteria.isActive;
      }

      if (searchCriteria.minDiscountValue !== undefined || searchCriteria.maxDiscountValue !== undefined) {
        filter.discountValue = {};
        if (searchCriteria.minDiscountValue !== undefined) {
          filter.discountValue.$gte = searchCriteria.minDiscountValue;
        }
        if (searchCriteria.maxDiscountValue !== undefined) {
          filter.discountValue.$lte = searchCriteria.maxDiscountValue;
        }
      }

      if (searchCriteria.validAfter || searchCriteria.validBefore) {
        filter.validFrom = {};
        if (searchCriteria.validAfter) {
          filter.validFrom.$gte = searchCriteria.validAfter;
        }
        if (searchCriteria.validBefore) {
          filter.validTo = { $lte: searchCriteria.validBefore };
        }
      }

      if (searchCriteria.isActive !== undefined) {
        filter.isActive = searchCriteria.isActive;
      } else {
        filter.isActive = true;
      }

      const promocodes = await Promocode.find(filter)
        .populate('propertyId', 'name code')
        .populate('applicableRoomType', 'roomType roomName')
        .populate('applicableRatePlans', 'ratePlanName code')
        .select('propertyId propertyCode codeName code description discountType discountValue validFrom validTo minBookingAmount maxDiscountAmount applicableRoomType applicableRatePlans isActive ')
        .sort({ createdAt: -1 })
        .lean();

      return promocodes;

    } catch (error) {
      console.error("Error searching promocodes:", error);
      throw new Error(`Failed to search promocodes: ${error.message}`);
    }
  }
}
