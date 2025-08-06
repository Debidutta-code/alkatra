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
}