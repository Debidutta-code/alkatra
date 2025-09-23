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

      console.log("The fileter options are", filterOptions);
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

  async userUsageTracker(req: any, res: Response, next: NextFunction) {
    try {
      const customerAuthData = req.user;

      if (!customerAuthData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const promoCodeId = req.params.promoId;
      if (!promoCodeId) {
        return res.status(400).json({
          success: false,
          message: "Promo code ID is required",
        });
      }

      const userUsageDetails = await this.promoCodeService.userUsageTracker(promoCodeId, customerAuthData.id);
      if (!userUsageDetails) {
        return res.status(404).json({
          success: false,
          message: "User usage details not found",
        })
      }

      return res.status(200).json({
        success: true,
        message: "User usage details fetched successfully",
        data: userUsageDetails
      });

    }
    catch (error: any) {
      console.log("Error while creating user usage details");
      return res.status(500).json({
        success: false,
        message: "Error while creating user usage details",
        error: error.message,
      });
    }
  }

}
