import { PropertyInfoRepository } from "../property_management/src/repositories";

export class CommonService {
    private static instance: CommonService;
    private propertyInfoRepository: PropertyInfoRepository

    private constructor(propertyInfoRepository: PropertyInfoRepository) { 
        this.propertyInfoRepository = propertyInfoRepository
    }

    public static getInstance(propertyInfoRepository: PropertyInfoRepository): CommonService {
        if (!CommonService.instance) {
            CommonService.instance = new CommonService(propertyInfoRepository);
        }
        return CommonService.instance;
    }


    /**
     * Verify the ownership of user for the property
     */
    async verifyOwnership(userId: string, propertyId: string): Promise<boolean> {
        const property = await this.propertyInfoRepository.getById(propertyId);
        if (!property) throw new Error("Property not found");

        return property?.user_id.toString() === userId;
    }

}