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

    async ratePlanCreate () {}

    async ratePlanFind () {}



}