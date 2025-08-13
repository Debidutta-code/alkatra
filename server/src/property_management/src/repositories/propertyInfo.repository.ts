import { PropertyInfo, PropertyInfoType } from "../model";


export class PropertyInfoRepository {
    private static instance: PropertyInfoRepository;

    constructor() { }

    static getInstance(): PropertyInfoRepository {
        if (!PropertyInfoRepository.instance) {
            PropertyInfoRepository.instance = new PropertyInfoRepository();
        }
        return PropertyInfoRepository.instance;
    }


    async getById(id: string): Promise<PropertyInfoType | null> {
        try {
            return await PropertyInfo.findById(id).exec();
        } catch (error: any) {
            console.error("Failed to find property by ID at Repository Layer:", error);
            throw error;
        }
    }


    /**
     * Find by hotel code
     */
    async findByHotelCode(hotelCode: string): Promise<PropertyInfoType | null> {
        try {
            return await PropertyInfo.findOne({ property_code: hotelCode }).exec();
        } catch (error: any) {
            console.error("Failed to find property by hotel code at Repository Layer:", error);
            throw error;
        }
    }


    /**
     * Assign tax group to the property
     */
    async assignTaxGroup(propertyId: string, taxGroupId: string): Promise<PropertyInfoType | null> {
        try {
            return await PropertyInfo.findOneAndUpdate(
                { _id: propertyId },
                { $set: { tax_group: taxGroupId } },
                { new: true }
            ).exec();
        } catch (error: any) {
            console.error("Failed to assign tax group to property at Repository Layer:", error);
            throw error;
        }
    }

}