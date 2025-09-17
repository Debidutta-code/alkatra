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

    async propertyUpdate (
        propertInfoId: string,
        property_name: string,
        property_email: string,
        property_contact: string,
        star_rating: string,
        image: string[],
        description: string,
        status?: string
    ): Promise<PropertyInfoType> {
        if(!propertInfoId) {
            throw new Error("Property ID is required");
        }

        const filteredUpdates: Partial<PropertyInfoType> = {};

        if (property_name) filteredUpdates.property_name = property_name;
        if (property_email) filteredUpdates.property_email = property_email;
        if (property_contact) filteredUpdates.property_contact = property_contact;
        if (image) filteredUpdates.image = image;
        if (description) filteredUpdates.description = description;
        if (status) filteredUpdates.status = status;

        const propertyUpdateResponse = await this.propertyInfoRepository.propertyUpdate(
            propertInfoId,
            filteredUpdates
        );        

        if (!propertyUpdateResponse) {
            throw new Error("Failed to update property");
        }

        return propertyUpdateResponse;
    }

}