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
        try {
            /**
             * Check if a rate plan already exists for the given hotelCode and invTypeCode
             */
            const existingData = await this.ratePlanRepository.ratePlanFind(data.hotelCode, data.invTypeCode);
            if (existingData) {
                throw new Error("Rate plan or inventory already exists for the given hotelCode and invTypeCode");
            }

            console.log("The data for new rate plan creation:", data);

            /**
             * If no existing rate plan is found, proceed to create a new rate plan
             */
            const createNewRatePlan = await this.ratePlanRepository.ratePlanCreate(data);
            if (!createNewRatePlan) {
                throw new Error("Failed to create rate plan");
            }
            
            return createNewRatePlan;
        }
        catch (error: any) {
            console.log("Error in ratePlanCreate service:", error);
            throw new Error("Error while creating rate plan");
        }
    }
}