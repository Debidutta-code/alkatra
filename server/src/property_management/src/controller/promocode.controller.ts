import { NextFunction, Request, Response, } from "express";
import { PromoCodeService } from "../service";

export class PromoCodeController {

  /**
     * 
     */
  private static instance: PromoCodeController;

  private promoCodeService = PromoCodeService.getInstance();

  /**
   * 
   */
  private constructor() {
    this.promoCodeService = PromoCodeService.getInstance();
  }

  /**
   * 
   */
  static getInstance(): PromoCodeController {
    if (!PromoCodeController.instance) {
      PromoCodeController.instance = new PromoCodeController();
    }
    return PromoCodeController.instance;
  }

  /**
   * 
   */

  async createPromoCode(req: any, res: Response, next: NextFunction) {

    try {
      const authData = req.user;


      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = req.body;
      if (!data) {
        return res.status(400).json({
          succsess: false,
          message: "Promocode details are required",
        })
      }

      const promoCreatedResponse = await this.promoCodeService.createPromoCode(data, authData.id);
      if (!promoCreatedResponse) {
        return res.status(200).json(promoCreatedResponse);
      }

      return res.status(200).json({ success: true, message: "Promocode created successfully", data: promoCreatedResponse });

    }
    catch (error) {
      console.log("Error occurred while creating PromoCode", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while creating PromoCode",
        error: error.message,
      });
    }
  }

  async getPromoCode(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const {
        page = 1,
        limit = 10,
        propertyCode,
        propertyId,
        code,
        discountType,
        isActive,
        validFrom,
        validTo,
        minDiscountValue,
        maxDiscountValue,
        search,
        sortBy = "createdAt",
        sortOrder = "desc"
      } = req.query;


      const filters: any = {};

      if (propertyCode) filters.propertyCode = propertyCode;
      if (propertyId) filters.propertyId = propertyId;
      if (code) filters.code = { $regex: code, $options: 'i' };
      if (discountType) filters.discountType = discountType;
      if (isActive !== undefined) filters.isActive = isActive === 'true';


      if (validFrom) filters.validFrom = { $gte: new Date(validFrom as string) };
      if (validTo) filters.validTo = { $lte: new Date(validTo as string) };


      if (minDiscountValue || maxDiscountValue) {
        filters.discountValue = {};
        if (minDiscountValue) filters.discountValue.$gte = parseInt(minDiscountValue as string);
        if (maxDiscountValue) filters.discountValue.$lte = parseInt(maxDiscountValue as string);
      }


      if (search) {
        filters.$or = [
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { propertyCode: { $regex: search, $options: 'i' } }
        ];
      }

      const filterOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

    
      const result = await this.promoCodeService.getAllPromoCode(filterOptions);

      return res.status(200).json({
        success: true,
        message: "Promocode fetched successfully",
        data: result.data,
        pagination: result.pagination
      });

    } catch (error: any) {
      console.log("Error occurred while getting PromoCode", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while getting PromoCode",
        error: error.message, 
      });
    }
  }

  async updatePromoCode(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const id = req.params.promoId;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Promo code ID is required",
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Update data is required",
        });
      }

      /**
       * Removing property code and Property Id from update data
       * Those field can't be update
       */
      const { propertyCode, propertyId, ...filteredUpdateData } = updateData;

      if (Object.keys(filteredUpdateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update",
        });
      }

      const updatedPromoCode = await this.promoCodeService.updatePromoCode(id, filteredUpdateData, authData.id);

      if (!updatedPromoCode) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Promo code updated successfully",
        data: updatedPromoCode
      });

    } catch (error: any) {
      console.log("Error occurred while updating PromoCode", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("Validation failed")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error occurred while updating PromoCode",
        error: error.message,
      });
    }
  }

  async deletePromoCode(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const id = req.params.promoId;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Promo code ID is required",
        });
      }

      const deletedPromoCode = await this.promoCodeService.deletePromoCode(id, authData.id);

      if (!deletedPromoCode) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Promo code deleted successfully",
        data: {
          id: deletedPromoCode._id,
          code: deletedPromoCode.code,
          propertyCode: deletedPromoCode.propertyCode
        }
      });

    } catch (error: any) {
      console.log("Error occurred while deleting PromoCode", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error occurred while deleting PromoCode",
        error: error.message,
      });
    }
  }

  /**
   * Validate and apply promocode
   */
  // async validatePromocode(req: any, res: Response, next: NextFunction) {
  //   try {
  //     const authData = req.user;

  //     if (!authData) {
  //       return res.status(401).json({
  //         success: false,
  //         message: "Unauthorized",
  //       });
  //     }

  //     const { code, bookingAmount, propertyCode, propertyId } = req.body;

  //     if (!code || !bookingAmount) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Promocode and booking amount are required",
  //       });
  //     }

  //     if (!propertyCode && !propertyId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Either property code or property ID is required",
  //       });
  //     }

  //     const validationResult = await this.promoCodeService.validatePromocodeForUse(
  //       code,
  //       authData.id,
  //       parseFloat(bookingAmount),
  //       { propertyCode, propertyId }
  //     );

  //     if (!validationResult.isValid) {
  //       return res.status(200).json({
  //         success: false,
  //         message: validationResult.message,
  //         isValid: false
  //       });
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       message: validationResult.message,
  //       isValid: true,
  //       data: {
  //         promocode: validationResult.promocode,
  //         discountAmount: validationResult.discountAmount,
  //         finalAmount: validationResult.finalAmount
  //       }
  //     });

  //   } catch (error: any) {
  //     console.log("Error occurred while validating promocode", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Error occurred while validating promocode",
  //       error: error.message,
  //     });
  //   }
  // }

  async validatePromocode(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      

      const { code, bookingAmount, propertyCode, propertyId, apply = false } = req.body;
      const codeName = code;

      if (!codeName || !bookingAmount) {
        return res.status(400).json({
          success: false,
          message: "Promocode and booking amount are required",
        });
      }

      if (!propertyCode && !propertyId) {
        return res.status(400).json({
          success: false,
          message: "Either property code or property ID is required",
        });
      }      

      let result: any;

      if (apply === true) {
        // APPLY THE PROMOCODE (validates + increases usage)
        result = await this.promoCodeService.applyPromocode(
          codeName,
          authData.id,
          parseFloat(bookingAmount),
          { propertyCode, propertyId }
        );

        if (!result.success) {
          return res.status(200).json({
            success: false,
            message: result.message,
            isValid: false
          });
        }

        return res.status(200).json({
          success: true,
          message: result.message,
          isValid: true,
          applied: true,
          data: {
            discountAmount: result.discountAmount,
            finalAmount: parseFloat(bookingAmount) - (result.discountAmount || 0)
          }
        });

      } else {
        // ONLY VALIDATE (doesn't increase usage)
        const validationResult = await this.promoCodeService.validatePromocodeForUse(
          codeName,
          authData.id,
          parseFloat(bookingAmount),
          { propertyCode, propertyId }
        );

        if (!validationResult.isValid) {
          return res.status(200).json({
            success: false,
            message: validationResult.message,
            isValid: false
          });
        }

        console.log("The response result: ", {
            promocode: validationResult.promocode,
            discountAmount: validationResult.discountAmount,
            finalAmount: validationResult.finalAmount
          });

        return res.status(200).json({
          success: true,
          message: validationResult.message,
          isValid: true,
          applied: false,
          data: {
            promocode: validationResult.promocode,
            discountAmount: validationResult.discountAmount,
            finalAmount: validationResult.finalAmount
          }
        });
      }

    } catch (error: any) {
      console.log("Error occurred while validating promocode", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while validating promocode",
        error: error.message,
      });
    }
  }

  /**
   * Track promocode usage
   */
  async trackPromocodeUsage(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const {
        promoCodeId,
        bookingId,
        originalAmount,
        discountedAmount,
        finalAmount,
        discountApplied,
      } = req.body;

      // Required fields validation
      const requiredFields = [
        'promoCodeId', 'bookingId', 'originalAmount',
        'discountedAmount', 'finalAmount', 'discountApplied'
      ];

      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Get promocode to validate discount values
      const promocode = await this.promoCodeService.getPromocodeById(promoCodeId);
      if (!promocode) {
        return res.status(404).json({
          success: false,
          message: "Promocode not found",
        });
      }

      const usageData = {
        promoCodeId,
        customerId: authData.id,
        bookingId,
        discountType: promocode.discountType,
        discountValue: promocode.discountValue,
        originalAmount: parseFloat(originalAmount),
        discountedAmount: parseFloat(discountedAmount),
        finalAmount: parseFloat(finalAmount),
        discountApplied: parseFloat(discountApplied),
      };

      const result = await this.promoCodeService.trackPromocodeUsage(usageData);

      return res.status(200).json({
        success: true,
        message: "Promocode usage tracked successfully",
        data: result
      });

    } catch (error: any) {
      console.log("Error occurred while tracking promocode usage", error);

      if (error.message.includes("usage limit exceeded")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error occurred while tracking promocode usage",
        error: error.message,
      });
    }
  }

  /**
   * Cancel promocode usage (for booking cancellations)
   */
  async cancelPromocodeUsage(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { bookingId, reason = "cancelled" } = req.body;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID is required",
        });
      }

      if (!["cancelled", "expired"].includes(reason)) {
        return res.status(400).json({
          success: false,
          message: "Reason must be either 'cancelled' or 'expired'",
        });
      }

      const result = await this.promoCodeService.cancelPromocodeUsage(bookingId, reason);

      return res.status(200).json({
        success: true,
        message: `Promocode usage ${reason} successfully`,
        data: result
      });

    } catch (error: any) {
      console.log("Error occurred while cancelling promocode usage", error);

      if (error.message.includes("No promocode usage found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error occurred while cancelling promocode usage",
        error: error.message,
      });
    }
  }

  /**
   * Get promocode usage statistics
   */
  async getPromocodeUsageStats(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const promoCodeId = req.params.promoId;

      if (!promoCodeId) {
        return res.status(400).json({
          success: false,
          message: "Promocode ID is required",
        });
      }

      const stats = await this.promoCodeService.getPromocodeUsageStats(promoCodeId);

      return res.status(200).json({
        success: true,
        message: "Promocode usage statistics fetched successfully",
        data: stats
      });

    } catch (error: any) {
      console.log("Error occurred while fetching promocode usage stats", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while fetching promocode usage stats",
        error: error.message,
      });
    }
  }

  /**
   * Get user's promocode usage history
   */
  async getUserPromocodeHistory(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const {
        page = 1,
        limit = 10,
        status,
        promoCodeId,
        startDate,
        endDate
      } = req.query;

      const filters: any = {};

      if (status) filters.status = status;
      if (promoCodeId) filters.promoCodeId = promoCodeId;

      if (startDate || endDate) {
        filters.usageDate = {};
        if (startDate) filters.usageDate.$gte = new Date(startDate as string);
        if (endDate) filters.usageDate.$lte = new Date(endDate as string);
      }

      const history = await this.promoCodeService.getUserPromocodeHistory(
        authData.id,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "User promocode history fetched successfully",
        data: history
      });

    } catch (error: any) {
      console.log("Error occurred while fetching user promocode history", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while fetching user promocode history",
        error: error.message,
      });
    }
  }

  /**
   * Get recent usage for a specific promocode
   */
  async getPromocodeRecentUsage(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const promoCodeId = req.params.promoId;
      const { page = 1, limit = 10 } = req.query;

      if (!promoCodeId) {
        return res.status(400).json({
          success: false,
          message: "Promocode ID is required",
        });
      }

      const result = await this.promoCodeService.getPromocodeRecentUsage(
        promoCodeId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      return res.status(200).json({
        success: true,
        message: "Promocode recent usage fetched successfully",
        data: result.data,
        pagination: result.pagination
      });

    } catch (error: any) {
      console.log("Error occurred while fetching promocode recent usage", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while fetching promocode recent usage",
        error: error.message,
      });
    }
  }

  /**
   * Get property promocode analytics
   */
  async getPropertyPromocodeAnalytics(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { propertyId } = req.params;
      const { startDate, endDate } = req.query;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: "Property ID is required",
        });
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await this.promoCodeService.getPropertyPromocodeAnalytics(
        propertyId,
        start,
        end
      );

      return res.status(200).json({
        success: true,
        message: "Property promocode analytics fetched successfully",
        data: analytics
      });

    } catch (error: any) {
      console.log("Error occurred while fetching property promocode analytics", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while fetching property promocode analytics",
        error: error.message,
      });
    }
  }

  /**
   * Enhanced user usage tracker
   */
  async userUsageTracker(req: any, res: Response, next: NextFunction) {
    try {
      const customerAuthData = req.user;

      if (!customerAuthData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const promoCodeId = req.query.promoCodeId;
      const { startDate, endDate, status } = req.query;

      const filters: any = {};

      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (status) filters.status = status;

      const userUsageDetails = await this.promoCodeService.userUsageTracker(
        customerAuthData.id,
        promoCodeId,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "User usage details fetched successfully",
        data: userUsageDetails
      });

    } catch (error: any) {
      console.log("Error while fetching user usage details", error);
      return res.status(500).json({
        success: false,
        message: "Error while fetching user usage details",
        error: error.message,
      });
    }
  }

  /**
   * Check if user can use a promocode
   */
  async checkUserPromocodeEligibility(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { promoCodeId } = req.params;

      if (!promoCodeId) {
        return res.status(400).json({
          success: false,
          message: "Promocode ID is required",
        });
      }

      const eligibility = await this.promoCodeService.checkUserPromocodeEligibility(
        promoCodeId,
        authData.id
      );

      return res.status(200).json({
        success: true,
        message: "User eligibility checked successfully",
        data: eligibility
      });

    } catch (error: any) {
      console.log("Error checking user promocode eligibility", error);
      return res.status(500).json({
        success: false,
        message: "Error checking user promocode eligibility",
        error: error.message,
      });
    }
  }

  /**
   * Get promocode by ID
   */
  async getPromocodeById(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const promoCodeId = req.params.promoId;

      if (!promoCodeId) {
        return res.status(400).json({
          success: false,
          message: "Promocode ID is required",
        });
      }

      const promocode = await this.promoCodeService.getPromocodeById(promoCodeId);

      return res.status(200).json({
        success: true,
        message: "Promocode fetched successfully",
        data: promocode
      });

    } catch (error: any) {
      console.log("Error occurred while fetching promocode", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error occurred while fetching promocode",
        error: error.message,
      });
    }
  }

  /**
   * Search promocodes
   */
  async searchPromocodes(req: any, res: Response, next: NextFunction) {
    try {
      const authData = req.user;

      if (!authData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const searchCriteria = req.query;

      const promocodes = await this.promoCodeService.searchPromocodes(searchCriteria);

      return res.status(200).json({
        success: true,
        message: "Promocodes searched successfully",
        data: promocodes
      });

    } catch (error: any) {
      console.log("Error occurred while searching promocodes", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while searching promocodes",
        error: error.message,
      });
    }
  }

}
