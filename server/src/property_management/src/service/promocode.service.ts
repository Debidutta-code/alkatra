import { PromoCodeRepository } from "../repositories";
import { IPromocode } from "../model/promocode.model";

export class PromoCodeService {

  /**
   * 
   */
  private static instance: PromoCodeService;

  private promoCodeRepository = PromoCodeRepository.getInstance();

  /**
   * 
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


  async createPromoCode() {}

  async getAllPromoCode() {}

  async getPromoCodeByIdOrCode() {}

  async getPromoCodeByPropertyIdOrCode() {}

  async updatePromoCode() {}

  async deletePromoCode() {}

  
  // public static async createPromoCode(
  //   data: any,
  //   propertyId: any
  // ) {
  //   try {
  //     const existing = await PromoCodeDAO.findByCode(data.code!, propertyId);
  //     if (existing) {
  //       return {
  //         success: false,
  //         message: "The Given PromoCode already exist for this Property",
  //       };
  //     }
  //     if (data.validFrom && data.validTo && data.validFrom > data.validTo) {
  //       return {
  //         success: false,
  //         message: "Valid From date cannot be later than Valid To date",
  //       };
  //     }

  //     const formattedData = {
  //       ...data,
  //       propertyId,
  //       deviceType: Array.isArray(data.deviceType) ? data.deviceType : [data.deviceType],
  //       validFrom: new Date(data.validFrom),
  //       validTo: new Date(data.validTo),
  //     };
  //     console.log("Formatted Data:", formattedData);

  //     // Ensure deviceType is logged correctly
  //     console.log("Device Type:", formattedData.deviceType);

  //     // Ensure date fields are correct
  //     console.log("Valid From:", formattedData.validFrom);
  //     console.log("Valid To:", formattedData.validTo);

  //     // Attempt to create the promocode
  //     const PromoCode = await PromoCodeDAO.create(formattedData);
  //     if (!PromoCode) {
  //       return {
  //         success: false,
  //         message: "PromoCode failed to create",
  //       };
  //     }
  //     return {
  //       success: true,
  //       message: "PromoCode Created successfully",
  //       data: PromoCode,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "failed to create Promocode",
  //       error: error?.message
  //     };
  //   }
  // }


  // public static async getPromoCode(id: string) {
  //   try {
  //     const promoCodes = await PromoCodeDAO.findById(id);
  //     if (!promoCodes) {
  //       return {
  //         success: false,
  //         message: "PromoCodes not Found ",
  //       };
  //     }
  //     return {
  //       success: true,
  //       message: "Promocode fetched Succsessfully",
  //       data: promoCodes,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while fetching PromoCode",
  //       error: error?.message,
  //     };
  //   }
  // }

  // public static async getAllPromoCodes(id: string) {
  //   try {
  //     const response = await PromoCodeDAO.findAll(id);
  //     if (!response) {
  //       return {
  //         success: false,
  //         message: "No Promocode available in this property",
  //       };
  //     }
  //     return {
  //       success: true,
  //       message: "Promocode fetched Successfully",
  //       data: response,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while fetching PromoCode",
  //       error: error?.message,
  //     };
  //   }
  // }

  // public static async updatePromoCode(id: string, data: Partial<IPromocode>) {
  //   try {
  //     if (!data?.code || !data?.propertyId) {
  //       return {
  //         success: false,
  //         message:
  //           "Both code and propertyId are required to check existing promocode",
  //       };
  //     }
  //     const existing = await PromoCodeDAO.findByCode(
  //       data.code,
  //       data.propertyId
  //     );
  //     if (existing && existing.id.toString() !== id) {
  //       return {
  //         success: false,
  //         message: "This promocode already exist in this property",
  //       };
  //     }
  //     const response = await PromoCodeDAO.update(id, data);

  //     if (!response) {
  //       return {
  //         success: false,
  //         message: "Promocode not found or could not be updated",
  //       };
  //     }

  //     return {
  //       success: true,
  //       message: "Promocode updated successfully",
  //       data: response,
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while updating the PromoCode",
  //       error: error?.message || "Unknown error",
  //     };
  //   }
  // }

  // public static async deletePromoCode(id: string) {
  //   try {
  //     const existing = await PromoCodeDAO.findById(id);
  //     if (!existing) {
  //       return {
  //         success: true,
  //         message: "Promocode already deleted",
  //       };
  //     }
  //     const response = PromoCodeDAO.delete(id);
  //     if (!response) {
  //       return {
  //         success: false,
  //         message: "Failed to delete promo code",
  //       };
  //     }
  //     return {
  //       success: true,
  //       message: "Promocode deleted Succsessfully",
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occurred while deleting the PromoCode",
  //       error: error?.message,
  //     };
  //   }
  // }

  // public static async validatePromoCode(data: any) {
  //   try {
  //     const promo = await PromoCodeDAO.findByCode(
  //       data.promoCode,
  //       data.propertyId
  //     );
  //     if (!promo) {
  //       return {
  //         success: false,
  //         message: "Promo code not found",
  //       };
  //     }
  //     if (!promo.isActive) {
  //       return {
  //         success: false,
  //         message: "Promo code is inactive",
  //       };
  //     }
  //     console.log("promocode", promo);
  //     if (promo.useLimit === 0) {
  //       return {
  //         success: false,
  //         message: "Promo code Limit reached",
  //       };
  //     }
  //     if (!(promo.deviceType as string[]).includes(data.Devicetype)) {
  //       return {
  //         success: false,
  //         message: `This Promo code is Not applicable for ${data.Devicetype} `,
  //       };
  //     }
  //     const now = new Date();
  //     const ValidTo = new Date(promo.validTo); // copy original date
  //     ValidTo.setDate(ValidTo.getDate() + 1);
  //     console.log("validto", ValidTo);
  //     if (promo.validFrom > now || ValidTo < now) {
  //       return {
  //         success: false,
  //         message: "Promo code expired or not yet valid",
  //       };
  //     }
  //     const bookingDetails = data.bookingDetails;
  //     const totalAmount = data.bookingDetails.finalPrice.breakdown.totalAmount;
  //     if (!totalAmount) {
  //       return {
  //         success: false,
  //         message: "bookingAmount required",
  //       };
  //     }
  //     const alreadyUsedbyuser = await PromoCodeDAO.findBookingbypromocode(
  //       data.promoCode,
  //       data.propertyId
  //     );

  //     const usageCount = alreadyUsedbyuser.filter(
  //       (b) => b.booking_user_email === bookingDetails.email
  //     ).length;
  //     console.log(usageCount);
  //     const MaxUsePeruser = promo.usageLimitPerUser || 1;
  //     console.log("max", MaxUsePeruser);
  //     if (usageCount >= MaxUsePeruser) {
  //       return {
  //         success: false,
  //         message: `This PromoCode is already used by the User`,
  //       };
  //     }

  //     if (promo.minBookingAmount && totalAmount < promo.minBookingAmount) {
  //       return {
  //         success: false,
  //         message: "Booking amount does not meet the minimum requirement",
  //       };
  //     }
  //     console.log("bookingdetails", bookingDetails);
  //     let discount = 0;
  //     const basePricebeforePromocode =
  //       bookingDetails.finalPrice?.breakdown?.totalBaseAmount;
  //     if (promo.discountType === "flat") {
  //       discount = promo.discountValue;
  //     } else if (promo.discountType === "percentage") {
  //       discount = (basePricebeforePromocode * promo.discountValue) / 100;
  //     }

  //     if (discount > basePricebeforePromocode) {
  //       discount = basePricebeforePromocode;
  //     }
  //     if (discount > promo.maxDiscountAmount!) {
  //       discount = promo.maxDiscountAmount!;
  //     }
  //     const basePriceAfterPromocode = basePricebeforePromocode - discount;
  //     const additionalcharges =
  //       bookingDetails.finalPrice.breakdown.totalAdditionalCharges;
  //     const finalprice = basePriceAfterPromocode + additionalcharges;

  //     return {
  //       success: true,
  //       message: "Promocode validated successfully",
  //       data: {
  //         promo,
  //         discount,
  //         basePriceAfterPromocode,
  //         finalprice,
  //       },
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: "Error occuered while validating promocode",
  //       error: error?.message,
  //     };
  //   }
  // }
}
