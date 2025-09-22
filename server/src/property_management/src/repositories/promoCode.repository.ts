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
   * 
   * @param promoCodeDetails 
   */
  async createPromoCode() { }

  /**
   * 
   */
  async getAllPromoCode() { }

  /**
   * 
   */
  async getPromoCodeById() { }

  /**
   * 
   */
  async getPromoCodeByCode() { }

  /**
   * 
   */
  async getPromoCodeByPropertyId() { }

  /**
   * 
   */
  async getPromoCodeByPropertyCode() { }

  /**
   * 
   */
  async updatePromoCode() { }

  /**
   * 
   */
  async deletePromoCode() { }










  // public static async findBookingbypromocode(promoCode: String, propertyId: string) {
  //   try {
  //     return await ThirdPartyBooking.find({ property: propertyId, PromoCode: promoCode })
  //   } catch (error) {
  //     throw error
  //   }
  // }

  // public static async create(data: any) {
  //   try {
  //     console.log(data)
  //     return await ThirdPartyBooking.promocodes.create({
  //       data: data
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // public static async findById(id: string) {
  //   try {
  //     return await ThirdPartyBooking.promocodes.findUnique({
  //       where: { id }
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // public static async findByCode(
  //   code: string,
  //   propertyId: any
  // ) {
  //   try {
  //     return await ThirdPartyBooking.promocodes.findFirst({
  //       where: {
  //         code: code,
  //         propertyId: propertyId
  //       }
  //     });

  //   } catch (error) {
  //     throw error
  //   }
  // }

  // public static async findAll(id: string) {
  //   try {
  //     return await ThirdPartyBooking.promocodes.findMany({
  //       where: { propertyId: id }
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // public static async update(
  //   id: string,
  //   data: any
  // ) {
  //   try {
  //     return await await ThirdPartyBooking.promocodes.update({
  //       where: { id: id },
  //       data: data,
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // public static async delete(id: string) {
  //   try {
  //     return await ThirdPartyBooking.promocodes.delete({
  //       where: { id }
  //     });
  //   } catch (error) {
  //     throw error
  //   }
  // }
}
