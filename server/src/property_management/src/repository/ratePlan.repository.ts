import { Inventory } from '../../../wincloud/src/model/inventoryModel';
import { RateAmount } from '../../../wincloud/src/model/ratePlanModel';
import { PropertyInfo } from '../model/property.info.model';
import { RatePlanDataDateWise } from '../interface';
import { Room } from '../model/room.model';
import RateAmountDateWise, { IRateAmountDateWise } from '../../../wincloud/src/model/ratePlanDateWise.model';


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
        return await Room.findOne({ room_type: invTypeCode }).select('room_type');
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
            invTypeCode: data.invTypeCode,
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

    /**
     * Convert rate plan data to date wise data
     */
    async convertDateWise(ratePlanCreateData: any) {
        const {
            hotelCode,
            hotelName,
            invTypeCode,
            ratePlanCode,
            startDate,
            endDate,
            days,
            currencyCode,
            baseByGuestAmts,
            additionalGuestAmounts
        } = ratePlanCreateData;

        // Validate required fields
        if (!hotelCode || !invTypeCode || !ratePlanCode) {
            throw new Error('Missing required fields for convert date wise: hotelCode, invTypeCode, or ratePlanCode');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateWiseData: Partial<IRateAmountDateWise>[] = [];

        // Generate one record per day from startDate to endDate (exclusive)
        for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
            dateWiseData.push({
                hotelCode,
                hotelName,
                invTypeCode,
                ratePlanCode,
                startDate: new Date(date),
                endDate: new Date(date.getTime() + 86400000),
                days,
                currencyCode,
                baseByGuestAmts,
                additionalGuestAmounts,
                createdAt: new Date()
            });
        }

        return dateWiseData;
    }


    /**
     * Insert date wise rate plan data
     * @param data 
     */
    async ratePlanCreateDateWise(data: any) {
        
        if (data.length > 0) {
            const insertResult = await RateAmountDateWise.insertMany(data, { ordered: false });
            return { insertedCount: insertResult.length };
        }
        return { insertedCount: 0 };
    }
}