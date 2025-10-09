import { ReservationDao } from "../dao";
import { Document } from "mongoose";


interface IPromocode extends Document {
    discountType: 'percentage' | 'flat';
    discountValue: number;
    minBookingAmount?: number;
    maxDiscountAmount?: number;
    isActive?: boolean;
}

interface ICouponCode extends Document {
    discountPercentage: number;
}

export class ReservationService {
    private static instance: ReservationService;
    private ratePlanRepository: ReservationDao;

    private constructor(ratePlanRepository: ReservationDao) {
        this.ratePlanRepository = ratePlanRepository;
    }

    static getInstance(ratePlanRepository: ReservationDao): ReservationService {
        if (!ReservationService.instance) {
            ReservationService.instance = new ReservationService(ratePlanRepository);
        }
        return ReservationService.instance;
    }

    async getReservationById(reservationId: string): Promise<any> {
        return this.ratePlanRepository.getReservationDetails(reservationId);
    };

    async calculateDiscountedPrice(reservationId: string): Promise<number> {

        if (!reservationId) {
            throw new Error("SERVICE: Reservation id not found to get reservation details");
        }

        const couponDetails = await this.ratePlanRepository.getReservationCouponDetails(reservationId);
        if (!couponDetails) {
            throw new Error("SERVICE: Does Not found reservation details");
        }

        const couponIds = couponDetails.coupon || [];

        const discountResults = await Promise.all(
            couponIds.map(couponId => this.ratePlanRepository.getCouponDetailsFromAnySource(couponId))
        );

        let totalDiscount = 0;
        for (const result of discountResults) {
            if (!result) continue;

            
            if ('discountPercentage' in result) {
                
                totalDiscount += (result as ICouponCode).discountPercentage;
            } else if ('discountType' in result) {
                
                const promo = result as IPromocode;
                if (promo.discountType === 'percentage' && promo.discountValue) {
                    if (!promo.minBookingAmount || promo.minBookingAmount <= 0) {
                        totalDiscount += promo.discountValue;
                    }
                    
                } else if (promo.discountType === 'flat' && promo.discountValue) {
                    const discount = Math.min(promo.discountValue, promo.maxDiscountAmount || promo.discountValue);
                    totalDiscount += discount;
                }
            }
        }

        return totalDiscount;
    }
}