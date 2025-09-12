import { RatePlanRepository } from '../repository/ratePlan.repository';
import { CreateRatePlanRequest } from "../interface";

export class RatePlanService {
    /**
     * Singleton instance of the RatePlanService
     */
    private static instance: RatePlanService;
    private ratePlanRepository: RatePlanRepository;

    /**
     * Private constructor to prevent direct instantiation
     */
    private constructor(ratePlanRepository: RatePlanRepository) {
        this.ratePlanRepository = ratePlanRepository;
    }

    /**
     * Get the singleton instance of the RatePlanService
     * @returns Singleton instance of the RatePlanService
     */
    public static getInstance(): RatePlanService {
        if (!RatePlanService.instance) {
            RatePlanService.instance = new RatePlanService(
                RatePlanRepository.getInstance()
            );
        }
        return RatePlanService.instance;
    }

    async ratePlanCreate(data: CreateRatePlanRequest) {
        /**
         * Check for hotel name
         */
        const hotelName = await this.ratePlanRepository.getHotelName(data.hotelCode);
        console.log("The hotel name is: ", hotelName);
        if (!hotelName) {
            throw new Error("Hotel not found with the given hotel code");
        }

        /**
         * Check for inventory type/ Room type code
         */
        const invTypeCode = await this.ratePlanRepository.checkInvTypeCode(data.invTypeCode);
        console.log("The inventory type code is: ", invTypeCode);
        if (!invTypeCode) {
            throw new Error("Inventory Type Code not found");
        }

        /**
         * Check if a rate plan already exists for the given hotelCode and invTypeCode
         */
        const existingData = await this.ratePlanRepository.ratePlanFind(data.hotelCode, data.invTypeCode);
        if (existingData) {
            throw new Error("Rate plan or inventory already exists for the given hotelCode and invTypeCode");
        }

        const ratePlanCreateData = {
            hotelCode: data.hotelCode,
            hotelName: hotelName,
            invTypeCode: invTypeCode,
            ratePlanCode: data.ratePlanCode,
            startDate: data.startDate,
            endDate: data.endDate,
            days: data.days,
            currencyCode: data.currencyCode,
            baseByGuestAmts: data.baseGuestAmounts,
            additionalGuestAmounts: data.additionalGuestAmounts
        };

        /**
         * If no existing rate plan is found, proceed to create a new rate plan
         */
        const createNewRatePlan = await this.ratePlanRepository.ratePlanCreate(ratePlanCreateData);
        if (!createNewRatePlan) {
            throw new Error("Failed to create rate plan");
        }

        /**
         * After create rate plan, now push the same data to RatePlanDateWise collection
         */
        // const convertDateWise = await this.ratePlanRepository.convertDateWise(ratePlanCreateData);
        // if (!convertDateWise) {
        //     throw new Error("Failed to convert to date-wise rate plan");
        // }

        // const createDateWiseRatePlan = await this.ratePlanRepository.ratePlanCreateDateWise(convertDateWise);
        // if (!createDateWiseRatePlan) {
        //     throw new Error("Failed to create date-wise rate plan");
        // }

        return createNewRatePlan;
    }
}