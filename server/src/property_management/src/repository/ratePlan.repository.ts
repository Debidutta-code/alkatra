import { Inventory } from '../../../wincloud/src/model/inventoryModel';
import { RateAmount } from '../../../wincloud/src/model/ratePlanModel';
import { PropertyInfo } from '../model/property.info.model';
import { CreateRatePlanRequest } from '../interface';
import { Room } from '../model/room.model';


export class RatePlanRepository {

    /**
     * Singleton instance of the RatePlanRepository
     */
    private static instance: RatePlanRepository

    /**
     * Private constructor to prevent direct instantiation
     */
    private constructor() { }

    /**
     * Get the singleton instance of the RatePlanRepository
     * @returns Singleton instance of the RatePlanRepository
     */
    static getInstance(): RatePlanRepository {
        if (!RatePlanRepository.instance) {
            RatePlanRepository.instance = new RatePlanRepository()
        }
        return RatePlanRepository.instance
    }

    /**
     * Getting Hotel Name by hotelCode
     * @param hotelCode 
     * @returns 
     */
    async getHotelName(hotelCode: string) {
        return await PropertyInfo.findOne({ property_code: hotelCode }).select('property_name');
    }

    /**
     * Checking Inventory Type Code
     * @param invTypeCode 
     * @returns 
     */
    async checkInvTypeCode(invTypeCode: string) {
        return await Room.findOne({ room_type_code: invTypeCode }).select('room_type');
    }

    /**
     * Finding existing Rate Plan by hotelCode and invTypeCode
     * @param hotelCode 
     * @param invTypeCode 
     * @returns 
     */
    async ratePlanFind(hotelCode: string, invTypeCode: string) {
        const ratePlanData1 = await RateAmount.findOne({ hotelCode, invTypeCode });
        if (ratePlanData1) {
            return ratePlanData1;
        }
        const ratePlanData2 = await Inventory.findOne({ hotelCode, invTypeCode });
        if (ratePlanData2) {
            return ratePlanData2;
        }

    }


    /**
     * Creating new Rate Plan
     * @param data
     * @returns
     */
    async ratePlanCreate(data: any) {
        const newRatePlan = new RateAmount({
            hotelCode: data.hotelCode,
            hotelName: data.hotelName,
            invTypeCode: data.checkInvType,
            ratePlanCode: data.ratePlanCode,
            startDate: data.startDate,
            endDate: data.endDate,
            days: data.days,
            currencyCode: data.currencyCode,
            baseByGuestAmts: data.baseGuestAmounts,
            additionalGuestAmounts: data.additionalGuestAmounts
        });

        const savedRatePlan = await newRatePlan.save();
        return savedRatePlan;
    }
}