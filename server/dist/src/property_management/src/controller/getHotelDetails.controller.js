"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllHotelDetailsAccordingToLocation = void 0;
const property_address_model_1 = require("../model/property.address.model");
const property_info_model_1 = require("../model/property.info.model");
const propertyamenite_model_1 = require("../model/propertyamenite.model");
const getAllHotelDetailsAccordingToLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location } = req.params;
        console.log(`The location we get from UI is: ${location}`);
        const propertyAddresses = yield property_address_model_1.PropertyAddress.aggregate([
            {
                $match: {
                    $or: [
                        // { $expr: { $eq: [{ $toLower: "$address_line_1" }, location.toLowerCase()] } },
                        // { $expr: { $eq: [{ $toLower: "$address_line_2" }, location.toLowerCase()] } },
                        // { $expr: { $eq: [{ $toLower: "$state" }, location.toLowerCase()] } },
                        { $expr: { $eq: [{ $toLower: "$city" }, location.toLowerCase()] } }
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
        const propertyIds = propertyAddresses.map((item) => item.property_id);
        const hotelDetails = yield property_info_model_1.PropertyInfo.find({
            _id: { $in: propertyIds }
        });
        if (hotelDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No hotel details found for the matched properties"
            });
        }
        const hotelsWithAmenities = yield Promise.all(hotelDetails.map((hotel) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const amenitiesId = hotel.property_amenities;
                if (!amenitiesId) {
                    console.warn(`No amenities ID found for hotel: ${hotel._id}`);
                    hotel.amenities = [];
                    return hotel;
                }
                const amenitiesDetails = yield propertyamenite_model_1.propertyAminity.findById(amenitiesId);
                if (!amenitiesDetails) {
                    console.warn(`No amenities details found for ID: ${amenitiesId}`);
                    hotel.amenities = [];
                    return hotel;
                }
                const filteredAmenities = Object.keys(amenitiesDetails.amenities || {}).reduce((acc, key) => {
                    if (amenitiesDetails.amenities[key]) {
                        acc[key] = amenitiesDetails.amenities[key];
                    }
                    return acc;
                }, {});
                hotel.amenities = filteredAmenities;
                console.log(`Filtered amenities for hotel ${hotel._id}:`, hotel.amenities);
                return Object.assign(Object.assign({}, hotel.toObject()), { amenities: hotel.amenities });
            }
            catch (error) {
                console.error(`Error fetching amenities for hotel ${hotel._id}:`, error);
                hotel.amenities = [];
                return Object.assign(Object.assign({}, hotel.toObject()), { amenities: hotel.amenities });
            }
        })));
        return res.status(200).json({
            success: true,
            message: "Hotel details fetched successfully",
            data: hotelsWithAmenities,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error while fetching price, please try again later"
        });
    }
});
exports.getAllHotelDetailsAccordingToLocation = getAllHotelDetailsAccordingToLocation;
//# sourceMappingURL=getHotelDetails.controller.js.map