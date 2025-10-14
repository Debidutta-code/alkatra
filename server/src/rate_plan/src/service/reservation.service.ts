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

    async calculateDiscountedPrice(reservationId: string, basePrice: number): Promise<number> {
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
                // Calculate percentage discount from couponModel
                const discountPercentage = (result as ICouponCode).discountPercentage;
                totalDiscount += (basePrice * discountPercentage) / 100;
            } else if ('discountType' in result) {
                const promo = result as IPromocode;
                if (promo.discountType === 'percentage' && promo.discountValue) {
                    // Calculate percentage discount from promocode
                    if (!promo.minBookingAmount || basePrice >= promo.minBookingAmount) {
                        let discount = (basePrice * promo.discountValue) / 100;
                        // Apply max discount limit if specified
                        if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
                            discount = promo.maxDiscountAmount;
                        }
                        totalDiscount += discount;
                    }
                } else if (promo.discountType === 'flat' && promo.discountValue) {
                    // Apply flat discount
                    const discount = promo.maxDiscountAmount
                        ? Math.min(promo.discountValue, promo.maxDiscountAmount)
                        : promo.discountValue;
                    totalDiscount += discount;
                }
            }
        }

        // Ensure discount doesn't exceed base price
        return Math.min(totalDiscount, basePrice);
    }
}