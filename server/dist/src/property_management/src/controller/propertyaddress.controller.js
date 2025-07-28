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
exports.getUniqueCities = exports.updatePropertyAddressBypropertyid = exports.getPropertyAddressById = exports.deletePropertyAddress = exports.updatePropertyAddress = exports.createPropertyAddress = void 0;
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
const property_address_model_1 = require("../model/property.address.model");
const property_info_model_1 = require("../model/property.info.model");
const createPropertyAddress = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { property_id, address_line_1, address_line_2, country, state, city, landmark, zip_code, } = req.body;
    console.log("req.body: ", req.body);
    if (!property_id ||
        !address_line_1 ||
        !country ||
        !state ||
        !city ||
        !landmark ||
        !zip_code) {
        return next(new appError_1.AppError("Please fill all the required fields", 400));
    }
    const newPropertyAddress = yield property_address_model_1.PropertyAddress.create({
        property_id,
        address_line_1,
        address_line_2,
        country,
        state,
        city,
        landmark,
        zip_code: parseInt(zip_code),
    });
    const updatedPropertyInfo = yield property_info_model_1.PropertyInfo.findByIdAndUpdate(property_id, {
        property_address: newPropertyAddress._id,
    });
    if (!updatedPropertyInfo) {
        return next(new appError_1.AppError(`No property found with this id ${property_id}`, 404));
    }
    const address = yield property_address_model_1.PropertyAddress.find({ propertyInfo: property_id });
    res.status(201).json({
        status: "success",
        error: false,
        total_address: address.length,
        message: "Property Address registered successfully",
        data: newPropertyAddress,
    });
}));
exports.createPropertyAddress = createPropertyAddress;
const updatePropertyAddress = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertAddressId = req.params.id;
    console.log("propertAddressId: ", propertAddressId);
    const { address_line_1, address_line_2, country, state, city, landmark, zip_code, } = req.body;
    const propertyAddress = yield property_address_model_1.PropertyAddress.find({ property_id: propertAddressId });
    console.log(propertyAddress);
    if (!propertyAddress) {
        return next(new appError_1.AppError(`No property found with this id ${propertAddressId}`, 404));
    }
    const updatePropertyAddress = yield property_address_model_1.PropertyAddress.findOneAndUpdate({ property_id: propertAddressId }, {
        $set: {
            address_line_1,
            address_line_2,
            country,
            state,
            city,
            landmark,
            zip_code,
        },
    }, { new: true });
    return res.status(200).json({
        status: "success",
        error: false,
        message: "Property address updated successfully",
        data: updatePropertyAddress,
    });
}));
exports.updatePropertyAddress = updatePropertyAddress;
const deletePropertyAddress = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyAddressId = req.params.id;
    const propertyAddress = yield property_address_model_1.PropertyAddress.findById(propertyAddressId);
    if (!propertyAddress) {
        return next(new appError_1.AppError(`No property address found with this id ${propertyAddressId}`, 404));
    }
    yield property_address_model_1.PropertyAddress.findByIdAndDelete(propertyAddressId);
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property address deleted successfully",
        data: null,
    });
}));
exports.deletePropertyAddress = deletePropertyAddress;
const getPropertyAddressById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyId = req.params.id;
    const property = yield property_address_model_1.PropertyAddress.find({ property_id: propertyId });
    console.log(propertyId);
    console.log(property);
    if (!property) {
        return next(new appError_1.AppError(`No property found with this id ------- ${propertyId}`, 404));
    }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property address fetched successfully",
        data: property,
    });
}));
exports.getPropertyAddressById = getPropertyAddressById;
const updatePropertyAddressBypropertyid = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyId = req.params.id;
        const { address_line_1, address_line_2, country, state, city, location, landmark, neighbour_area, zip_code, } = req.body;
        const propertyAddress = yield property_address_model_1.PropertyAddress.findOne({
            property_id: propertyId,
        });
        if (!propertyAddress) {
            return res.status(404).json({
                status: "error",
                message: `No property address found with property_id ${propertyId}`,
            });
        }
        const updatedPropertyAddress = yield property_address_model_1.PropertyAddress.findOneAndUpdate({ property_id: propertyId }, {
            address_line_1,
            address_line_2,
            country,
            state,
            city,
            location,
            landmark,
            neighbour_area,
            zip_code,
        }, { new: true });
        return res.status(200).json({
            status: "success",
            message: "Property address updated successfully",
            data: updatedPropertyAddress,
        });
    }
    catch (error) {
        return next(error);
    }
});
exports.updatePropertyAddressBypropertyid = updatePropertyAddressBypropertyid;
const getUniqueCities = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueCities = yield property_address_model_1.PropertyAddress.aggregate([
        {
            $match: { city: { $ne: null } }
        },
        {
            $group: {
                _id: "$city",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                city: "$_id"
            }
        },
        {
            $sort: { city: 1 }
        }
    ]);
    if (uniqueCities.length === 0) {
        return next(new appError_1.AppError("No cities found in property addresses", 404));
    }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Unique cities fetched successfully",
        data: uniqueCities.map(item => item.city)
    });
}));
exports.getUniqueCities = getUniqueCities;
//# sourceMappingURL=propertyaddress.controller.js.map