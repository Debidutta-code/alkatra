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
    private async getHotelName(hotelCode: string) {
        try {
            const hotelname = await PropertyInfo.findOne({ property_code: hotelCode }).select('property_name');
            if (!hotelname) {
                throw new Error("Hotel not found with the given hotel code");
            }
            return hotelname;
        }
        catch (error: any) {
            console.log("Error while getting the hotel name");
            throw new Error("Error while getting the hotel name");
        }
    }

    /**
     * Checking Inventory Type Code
     * @param invTypeCode 
     * @returns 
     */
    private async checkInvTypeCode ( invTypeCode: string ) {
        if ( !invTypeCode ) {
            throw new Error("Inventory Type Code is required");
        }
        try {
            const invTypeDetails = await Room.findOne({ room_type_code: invTypeCode });
            if ( !invTypeDetails ) {
                throw new Error("Inventory Type Code not found");
            }
            return invTypeDetails;
        }
        catch ( error: any ) {
            console.log("Error while checking the inventory type code");
            throw new Error("Error while checking the inventory type code");
        }
    }

    /**
     * Finding existing Rate Plan by hotelCode and invTypeCode
     * @param hotelCode 
     * @param invTypeCode 
     * @returns 
     */
    async ratePlanFind(hotelCode: string, invTypeCode: string) {
        try {
            const ratePlanData1 = await RateAmount.findOne({ hotelCode, invTypeCode });
            if (ratePlanData1) {
                return ratePlanData1;
            }

            const ratePlanData2 = await Inventory.findOne({ hotelCode, invTypeCode });
            if (ratePlanData2) {
                return ratePlanData2;
            }
        }
        catch (error: any) {
            console.log("Error in ratePlanFind repository:", error);
            throw new Error("Error while finding rate plan");
        }
    }

    /**
     * Creating new Rate Plan
     * @param data
     * @returns
     */
    async ratePlanCreate(data: CreateRatePlanRequest) {
        try {
            if (!data) {
                throw new Error("Data is required for create new rate plan");
            }

            const hotelName = await this.getHotelName(data.hotelCode);
            if (!hotelName) {
                throw new Error("Hotel not found with the given hotel code");
            }

            const checkInvType = await this.checkInvTypeCode(data.invTypeCode);
            if (!checkInvType) {
                throw new Error("Inventory Type Code not found");
            }

            const newRatePlan = new RateAmount({
                hotelCode: data.hotelCode,
                hotelName: hotelName, 
                invTypeCode: checkInvType,
                ratePlanCode: data.ratePlanCode,
                startDate: data.startDate,
                endDate: data.endDate,
                days: data.days,
                currencyCode: data.currencyCode,
                baseByGuestAmts: data.baseGuestAmounts,
                additionalGuestAmounts: data.additionalGuestAmounts
            });

            const savedRatePlan = await newRatePlan.save();
            if (!savedRatePlan) {
                throw new Error("Failed to create new rate plan");
            }

            return savedRatePlan;
        }
        catch (error: any) {
            console.log("Error in ratePlanCreate repository:", error);
            throw new Error("Error while creating rate plan");
        }
    }
}