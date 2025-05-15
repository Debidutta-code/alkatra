import { Request, Response } from "express";
import mongoose from 'mongoose';
import { PropertyAddress } from "../model/property.address.model";
import { PropertyInfo } from "../model/property.info.model";
import { propertyAminity } from "../model/propertyamenite.model";

export const getAllHotelDetailsAccordingToLocation = async (req: Request, res: Response) => {
    try {
        const { location } = req.params;
        const propertyAddresses = await PropertyAddress.aggregate([
            {
                $match: {
                    $or: [
                        { address_line_1: { $regex: location, $options: 'i' } },
                        { address_line_2: { $regex: location, $options: 'i' } },
                        { state: { $regex: location, $options: 'i' } },
                        { city: { $regex: location, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    property_id: 1
                }
            }
        ]);

        if (propertyAddresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No hotels found matching the provided location"
            });
        }

        const propertyIds = propertyAddresses.map((item: any) => item.property_id);
        const hotelDetails = await PropertyInfo.find({
            _id: { $in: propertyIds }
        });

        if (hotelDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No hotel details found for the matched properties"
            });
        }

        const hotelsWithAmenities = await Promise.all(hotelDetails.map(async (hotel: any) => {
            try {
                const amenitiesId = hotel.property_amenities;
                if (!amenitiesId) {
                    console.warn(`No amenities ID found for hotel: ${hotel._id}`);
                    hotel.amenities = [];
                    return hotel;
                }
        
                const amenitiesDetails = await propertyAminity.findById(amenitiesId);
                if (!amenitiesDetails) {
                    console.warn(`No amenities details found for ID: ${amenitiesId}`);
                    hotel.amenities = [];
                    return hotel;
                }       
                
                type Amenity = { [key: string]: boolean };        
                
                const filteredAmenities = Object.keys(amenitiesDetails.amenities || {}).reduce((acc: Amenity, key: string) => {
                    if ((amenitiesDetails.amenities as Amenity)[key]) {
                        acc[key] = (amenitiesDetails.amenities as Amenity)[key];
                    }
                    return acc;
                }, {});
        
                hotel.amenities = filteredAmenities;
                console.log(`Filtered amenities for hotel ${hotel._id}:`, hotel.amenities);
                return {
                    ...hotel.toObject(),
                    amenities: hotel.amenities
                };
            } catch (error) {
                console.error(`Error fetching amenities for hotel ${hotel._id}:`, error);
                hotel.amenities = [];
                return {
                    ...hotel.toObject(),
                    amenities: hotel.amenities
                };
            }
        }));

        return res.status(200).json({
            success: true,
            message: "Hotel details fetched successfully",
            data: hotelsWithAmenities,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error while fetching price, please try again later"
        });
    }
};
