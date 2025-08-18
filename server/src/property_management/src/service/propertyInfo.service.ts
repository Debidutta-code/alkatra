import { PropertyInfoType } from "../model";
import { PropertyInfoRepository } from "../repositories";

export class PropertyInfoService {
    private static instance: PropertyInfoService;
    private propertyInfoRepository: PropertyInfoRepository;

    constructor(propertyInfoRepository: PropertyInfoRepository) {
        this.propertyInfoRepository = propertyInfoRepository;
    }

    static getInstance(propertyInfoRepository: PropertyInfoRepository): PropertyInfoService {
        if (!PropertyInfoService.instance) {
            PropertyInfoService.instance = new PropertyInfoService(propertyInfoRepository);
        }
        return PropertyInfoService.instance;
    }


    async assignTaxGroupToProperty(propertyId: string, taxGroupId: string): Promise<Partial<PropertyInfoType> | null> {
        const response = await this.propertyInfoRepository.assignTaxGroup(propertyId, taxGroupId);
        return response._id;
    }


    async getPropertyByHotelCode(hotelCode: string) {
        const response = await this.propertyInfoRepository.findByHotelCode(hotelCode);
        return response;
    }

}