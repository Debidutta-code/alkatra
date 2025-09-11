import { RatePlanRepository } from '../repository/ratePlan.repository';

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
}