import { NextFunction, Request, Response, } from "express";
import { PromoCodeService } from "../service";
import { IPromoCodeRepository } from "../repositories";
import { auth } from "firebase-admin";
import { success } from "zod";


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

      const data  = req.body;
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



  // public static async createPromoCode(req: Request, res: Response) {
  //   try {
  //     const { propertyId } = req.params;
  //     const { data } = req.body;
  //     if (!propertyId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "PropertyId Required"
  //       })
  //     }
  //     if (!data) {
  //       return res.status(400).json({
  //         succsess: false,
  //         message: "Promocode details are required",
  //       })
  //     }
  //     if (!data.code) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Promocode required"
  //       })
  //     }
  //     const promo = await promoCodeService.createPromoCode(data, propertyId);
  //     if (promo?.success) {
  //       return res.status(200).json(promo);
  //     } else {
  //       return res.status(404).json(promo);
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while creating PromoCode",
  //       error: error.message,
  //     };
  //   }
  // }

  // public static async getOnePromocode(req: Request, res: Response) {
  //   try {
  //     const { promoId } = req.params;
  //     if (!promoId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Promo Id  required"
  //       })
  //     }
  //     const promo = await promoCodeService.getPromoCode(promoId);
  //     if (promo?.success) {
  //       return res.status(200).json(promo);
  //     }
  //     else {
  //       return res.status(200).json(promo);
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Something went Wrong while getting the Promocode",
  //       error: error.message,
  //     };
  //   }
  // }

  // public static async getAllPromoCodes(req: Request, res: Response) {
  //   try {
  //     const { propertyId } = req.params;
  //     if (!propertyId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Property Id required"
  //       })
  //     }

  //     const response = await promoCodeService.getAllPromoCodes(propertyId);
  //     if (response?.success) {
  //       return res.status(200).json(response);
  //     } else {
  //       return res.status(404).json(response);
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while creating PromoCode",
  //       error: error.message,
  //     };
  //   }
  // }

  // public static async UpdatePromoCode(req: Request, res: Response) {
  //   try {
  //     const { data } = req.body;
  //     const { promoId } = req.params
  //     if (!data) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Promocode details needed for update"
  //       })
  //     }
  //     const promo = await promoCodeService.updatePromoCode(promoId, data);
  //     if (promo?.success) {
  //       return res.status(200).json(promo);
  //     } else {
  //       return res.status(404).json(promo);
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while Updating PromoCode",
  //       error: error.message,
  //     };
  //   }
  // }

  // public static async DeletePromoCode(req: Request, res: Response) {
  //   try {
  //     const { promoId } = req.params;
  //     if (!promoId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Promo id is required"
  //       })
  //     }
  //     const promo = await promoCodeService.deletePromoCode(promoId);
  //     if (promo?.success) {
  //       return res.status(200).json(promo);
  //     } else {
  //       return res.status(404).json(promo);
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while deleting Promocode",
  //       error: error.message,
  //     };
  //   }
  // }

  // public static async validate(req: Request, res: Response) {
  //   try {
  //     const { data } = req.body;
  //     if (!data) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Data required to validate PromoCode"
  //       })
  //     }
  //     if (!data.promoCode) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "PromoCode required"
  //       })
  //     }
  //     if (!data.propertyId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "PropertyId required"
  //       })
  //     }
  //     if (!data.bookingDetails) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Booking Details required"
  //       })
  //     }
  //     const promo = await promoCodeService.validatePromoCode(data);
  //     if (promo?.success) {
  //       return res.status(200).json(promo);
  //     } else {
  //       return res.status(404).json(promo);
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while validating Promocode",
  //       error: error.message,
  //     };
  //   }
  // }

}
