import { PromoCodeRepository } from "../repositories";
import { IPromocode } from "../model/promoCode.model";
import { IPromoCodeRepository } from "../repositories";
import { generateUniquePromoCode } from "../utils";

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
}
