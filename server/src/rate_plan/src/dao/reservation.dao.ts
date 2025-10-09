import { ThirdPartyBooking } from "../../../wincloud/src/model/reservationModel";
import { Promocode } from "../../../property_management/src/model";
import { default as couponModel } from "../../../coupon_management/model/couponModel";

export class ReservationDao {
    private static instance: ReservationDao;

    private constructor() { }

    static getInstance(): ReservationDao {
        if (!ReservationDao.instance) {
            ReservationDao.instance = new ReservationDao();
        }
        return ReservationDao.instance;
    }

    async getReservationDetails(reservationId: string) {
        return ThirdPartyBooking.findOne({ reservationId: reservationId }).lean();
    }

    async getReservationCouponDetails(reservationId: string) {
        if (reservationId) {
            const couponData = await ThirdPartyBooking.findOne({ reservationId: reservationId }).select('coupon');
            
            if (couponData) {
                return couponData;
            }
        }
    }

    async getCouponDetailsFromPromoCode(coupon: string) {
        if (coupon) {
            const couponDetails = await Promocode.findOne({ code: coupon }).select('discountType discountValue minBookingAmount maxDiscountAmount');
            if (couponDetails) {
                return couponDetails;
            }
        }
    }

    async getCouponDetailsFromCouponModel(coupon: string) {
        if (coupon) {
            const couponDetails = await couponModel.findOne({ code: coupon }).select('discountPercentage');
            if (couponDetails) {
                return couponDetails;
            }
        }
    }

    async getCouponDetailsFromAnySource(coupon: string) {
        if (!coupon) return null;

        const [promoCodeDetails, couponModelDetails] = await Promise.all([
            Promocode.findOne({ code: coupon }).select('discountType discountValue minBookingAmount maxDiscountAmount'),
            couponModel.findOne({ code: coupon }).select('discountPercentage')
        ]);

        return promoCodeDetails || couponModelDetails || null;
    }
}