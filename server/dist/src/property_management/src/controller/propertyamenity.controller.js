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
exports.createPropertyAminity = exports.updatePropertyAmenity = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const property_info_model_1 = require("../model/property.info.model");
const propertyamenite_model_1 = require("../model/propertyamenite.model");
const createPropertyAminity = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { propertyInfo_id, destination_type, property_type, no_of_rooms_available, amenities, } = req.body;
    if (!propertyInfo_id || !property_type || no_of_rooms_available === undefined || !amenities) {
        return next(new appError_1.AppError("Please fill all the required fields", 400));
    }
    const newAminity = yield propertyamenite_model_1.propertyAminity.create({
        propertyInfo_id,
        destination_type,
        property_type,
        no_of_rooms_available,
        amenities,
    });
    const property = yield property_info_model_1.PropertyInfo.findByIdAndUpdate(propertyInfo_id, {
        property_amenities: newAminity._id,
    });
    if (!property) {
        return next(new appError_1.AppError("Property not found", 404));
    }
    res.status(201).json({
        status: "success",
        error: false,
        message: "Property amenities created successfully",
        data: newAminity,
    });
}));
exports.createPropertyAminity = createPropertyAminity;
const updatePropertyAmenity = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyId = req.params.id;
    const { destination_type, property_type, no_of_rooms_available, amenities } = req.body;
    if (!req.body) {
        return next(new appError_1.AppError("Please provide all the required details", 400));
    }
    const propertyAmenity = yield propertyamenite_model_1.propertyAminity.findOne({ propertyInfo_id: propertyId });
    if (!propertyAmenity) {
        return next(new appError_1.AppError("No property amenity found, please try again ...", 400));
    }
    const isEmpty = Object.keys(amenities).length === 0;
    const updateFields = {};
    if (destination_type !== "")
        updateFields.destination_type = destination_type;
    if (property_type !== "")
        updateFields.property_type = property_type;
    if (no_of_rooms_available !== null)
        updateFields.no_of_rooms_available = no_of_rooms_available;
    if (!isEmpty)
        updateFields.amenities = amenities;
    const updatedAmenity = yield propertyamenite_model_1.propertyAminity.findByIdAndUpdate(propertyAmenity._id, {
        $set: updateFields
    }, { new: true });
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property amenity updated successfully",
        data: updatedAmenity,
    });
}));
exports.updatePropertyAmenity = updatePropertyAmenity;
//# sourceMappingURL=propertyamenity.controller.js.map