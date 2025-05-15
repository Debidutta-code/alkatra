import { PropertyInfo } from "../model/property.info.model";

export const getAllPropertiesOfCategory = async (req: any, res: any) => {
    try {
        const { destination } = req.query;
        // console.log("$$$$$$$$$$$$$$$$$$\n",destination);
        
        const populatedProperties = await PropertyInfo.find({})
            .populate({ path: "property_category" })
            .populate({ path: "property_type" })
            .populate({ path: "property_address" })
            .populate({ path: "property_amenities" })
            .populate({ path: "property_room" })
            .populate({ path: "room_Aminity" })
            .populate({ path: "rate_plan" })

        const properties = populatedProperties.filter((property: any) => property.property_category.category === destination);
        console.log("$$$$$$$$$$$$$$$$$$\n",properties);

        return res.status(200).json({
            success: true,
            message: "Properties fetched successfully", 
            properties: properties
        })

    } catch (error: any) {
        return res.status(500).json({
            success: false,     
            message: "Internal error while fetching property, please try again later",
            error: error.message
        })
    }
}