// room.service.ts
import { PropertyInfo } from "../model/property.info.model";

export class PropertyDetails {

    async getRoomsByPropertyIdService(propertyInfoId: string) {
        const propertyDetails = await PropertyInfo.find(
            { _id: propertyInfoId },
            {
                property_category: 0,
                property_type: 0,
                property_room: 0,
                isDraft: 0,
                rate_plan: 0,
                brand: 0
            }
        )
            .populate([
                {
                    path: "property_address",
                    select: "-__v"
                },
                {
                    path: "property_amenities",
                    select: "-__v"
                }
            ])
            .lean()
            .exec();

        if (!propertyDetails || propertyDetails.length === 0) {
            throw new Error(`No property found with this id ${propertyInfoId}`);
        }
        return propertyDetails;
    };

}

