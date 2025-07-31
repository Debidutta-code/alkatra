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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminProperties = exports.getProperties = exports.getMyProperties = exports.getAllProperty = exports.getPropertyInfoById = exports.deleteProperty = exports.updatePropertyInfo = exports.createpropertyInfo = void 0;
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
const property_info_model_1 = require("../model/property.info.model");
const jwtHelper_1 = require("../utils/jwtHelper");
const propertycategory_model_1 = require("../model/propertycategory.model");
const property_address_model_1 = require("../model/property.address.model");
const propertyamenite_model_1 = require("../model/propertyamenite.model");
const room_amenite_model_1 = require("../model/room.amenite.model");
const ratePlan_model_1 = __importDefault(require("../model/ratePlan.model"));
const ratePlan_model_2 = __importDefault(require("../model/ratePlan.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_model_1 = __importDefault(require("../../../user_authentication/src/Model/auth.model"));
const createpropertyInfo = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.role === "user") {
        return next(new appError_1.AppError("You are not allowed to perform this action", 401));
    }
    const user = req.user;
    let isHotelFlow = false;
    let isHomestayFlow = false;
    const { property_name, property_email, property_contact, star_rating, property_code, image, description, property_category, property_type, } = req.body;
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n", property_name, property_email, property_contact, star_rating, property_code, image, description, property_category, property_type);
    const propertyCategory = property_category;
    if (propertyCategory === propertycategory_model_1.Category.HOTEL)
        isHotelFlow = true;
    if (propertyCategory === propertycategory_model_1.Category.HOMESTAY)
        isHomestayFlow = true;
    if (!req.body) {
        return next(new appError_1.AppError("Please fill all the required fields", 400));
    }
    let brandId = null;
    const property = yield property_info_model_1.PropertyInfo.findOne({ property_email });
    if (property) {
        return next(new appError_1.AppError("A property already exists with this email", 400));
    }
    // const propertyCode = await generateUniquePropertyCode();
    const newProperty = new property_info_model_1.PropertyInfo({
        user_id: user.id,
        property_name,
        property_email,
        property_contact,
        star_rating,
        property_code,
        image,
        property_category,
        property_type,
        description,
        brand: brandId,
    });
    yield newProperty.save();
    console.log("create Property ", newProperty);
    res.status(201).json({
        status: "success",
        error: false,
        message: "Property registered successfully",
        data: {
            isHomestayFlow,
            isHotelFlow,
            property: newProperty,
        },
    });
}));
exports.createpropertyInfo = createpropertyInfo;
const getMyProperties = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user.id;
    const properties = yield property_info_model_1.PropertyInfo.find({ user_id: user, isDraft: false });
    const draftProperties = yield property_info_model_1.PropertyInfo.find({ user_id: user, isDraft: true });
    res.status(200).json({
        status: "success",
        error: "false",
        message: "Data fetched successfully",
        data: {
            properties,
            draftProperties,
        },
    });
}));
exports.getMyProperties = getMyProperties;
const getAdminProperties = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validate userId exists
        if (!userId) {
            return next(new appError_1.AppError('User ID not found in request', 401));
        }
        // Validate userId is a valid ObjectId format
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return next(new appError_1.AppError('Invalid user ID format', 400));
        }
        const actualUser = yield auth_model_1.default.findById(userId);
        if (!actualUser) {
            return next(new appError_1.AppError('User not found', 404));
        }
        const userRole = actualUser.role;
        let responseData = {};
        console.log(userRole);
        switch (userRole) {
            case "superAdmin":
                const userEmail = actualUser.email;
                // 1. Get direct hotel managers created by superAdmin
                const directHotelManagers = yield auth_model_1.default.find({
                    role: "hotelManager",
                    createdBy: userEmail
                });
                // 2. Get group managers created by superAdmin
                const groupManagers = yield auth_model_1.default.find({
                    role: "groupManager",
                    createdBy: userEmail
                });
                // 3. Get properties for direct hotel managers
                const directHotelManagerIds = directHotelManagers.map(hm => hm._id);
                const directProperties = yield property_info_model_1.PropertyInfo.find({
                    user_id: { $in: directHotelManagerIds }
                }).select("_id image property_name");
                // 4. Process grouped hotels by group manager
                const groupedResults = [];
                for (const groupManager of groupManagers) {
                    // Get hotel managers under this group manager
                    const hotelManagersUnderGroup = yield auth_model_1.default.find({
                        role: "hotelManager",
                        createdBy: groupManager.email
                    });
                    // Get properties for these hotel managers
                    const hotelManagerIds = hotelManagersUnderGroup.map(hm => hm._id);
                    const propertiesUnderGroup = yield property_info_model_1.PropertyInfo.find({
                        user_id: { $in: hotelManagerIds }
                    }).select("_id image property_name");
                    // Format hotels array
                    const hotels = propertiesUnderGroup.map(property => ({
                        _id: property._id,
                        name: property.property_name,
                        image: property.image || []
                    }));
                    // Add to grouped results
                    groupedResults.push({
                        groupManagerName: `${groupManager.firstName} ${groupManager.lastName}` || groupManager.email,
                        id: groupManager._id.toString(),
                        hotels: hotels
                    });
                }
                // Format direct properties
                const directHotels = directProperties.map(property => ({
                    _id: property._id,
                    name: property.property_name,
                    image: property.image || []
                }));
                responseData = {
                    direct: directHotels,
                    grouped: groupedResults,
                };
                break;
            case "groupManager":
                // Get hotel managers created by this group manager
                const managedHotelManagers = yield auth_model_1.default.find({
                    role: "hotelManager",
                    createdBy: actualUser.email
                });
                if (managedHotelManagers.length === 0) {
                    console.log('No hotel managers found for this group manager');
                    responseData = {
                        properties: [],
                        draftProperties: []
                    };
                    break;
                }
                const managedHotelManagerIds = managedHotelManagers.map(hm => hm._id);
                console.log('Managed hotel manager IDs:', managedHotelManagerIds);
                // Fetch all properties for these hotel managers
                const allProperties = yield property_info_model_1.PropertyInfo.find({
                    user_id: { $in: managedHotelManagerIds }
                }).select("_id image property_name");
                // console.log('All properties found:', allProperties.length);
                const allHotels = allProperties.map(property => ({
                    _id: property._id,
                    name: property.property_name,
                    image: property.image || []
                }));
                responseData = {
                    direct: allHotels,
                };
                break;
            default:
                return next(new appError_1.AppError('Invalid user role', 400));
        }
        res.status(200).json({
            status: "success",
            error: false,
            message: "Data fetched successfully",
            data: responseData
        });
    }
    catch (error) {
        console.log('Error in getAdminProperties:', error.message);
        console.log('Full error:', error);
        return next(new appError_1.AppError('Internal server error', 500));
    }
}));
exports.getAdminProperties = getAdminProperties;
const updatePropertyInfo = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertInfoId = req.params.id;
    const { property_name, property_email, property_contact, 
    // star_rating,
    // property_code,
    image, description, } = req.body;
    const property = yield property_info_model_1.PropertyInfo.findById(propertInfoId);
    if (!property) {
        return next(new appError_1.AppError(`No property found with this id ${propertInfoId}`, 404));
    }
    // Check for duplicate property_email if changed
    if (property_email && property_email !== property.property_email) {
        const existingEmail = yield property_info_model_1.PropertyInfo.findOne({ property_email });
        if (existingEmail) {
            return next(new appError_1.AppError("A property already exists with this email", 400));
        }
    }
    // Check for duplicate property_code if changed
    // if (property_code && property_code !== property.property_code) {
    //   const existingCode = await PropertyInfo.findOne({ property_code });
    //   if (existingCode) {
    //     return next(new AppError("A property already exists with this property code", 400));
    //   }
    // }
    const updateProperty = yield property_info_model_1.PropertyInfo.findByIdAndUpdate(propertInfoId, {
        $set: {
            property_name,
            property_email,
            property_contact,
            // star_rating,
            // property_code,
            image,
            description,
        }
    }, { new: true });
    return res.status(200).json({
        status: "success",
        error: false,
        message: "Property updated successfully",
        data: updateProperty,
    });
}));
exports.updatePropertyInfo = updatePropertyInfo;
const getPropertyInfoById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyId = req.params.id;
    const property = yield property_info_model_1.PropertyInfo.findById(propertyId)
        .populate({ path: "property_category" })
        .populate({ path: "property_address" })
        .populate({ path: "property_amenities" })
        .populate({ path: "property_room" })
        .populate({ path: "room_Aminity" })
        .populate({ path: "rate_plan" })
        .lean();
    const rateplan = yield ratePlan_model_2.default.aggregate([
        { $match: { property_id: new mongoose_1.default.Types.ObjectId(propertyId) } },
        {
            $lookup: {
                from: 'rooms', // The collection to join
                localField: 'applicable_room_type', // The field from the input documents
                foreignField: '_id', // The field from the documents of the "from" collection
                as: 'applicable_room_type'
            }
        },
        { $unwind: '$applicable_room_type' },
        {
            $project: {
                applicable_room: '$applicable_room_type.room_name',
                applicable_room_type: '$applicable_room_type.room_type',
                propertyInfo_id: '$applicable_room_type.propertyInfo_id',
                _id: 1,
                meal_plan: 1,
                room_price: 1,
                rate_plan_name: 1,
                rate_plan_description: 1,
                min_length_stay: 1,
                max_length_stay: 1,
                min_book_advance: 1,
                max_book_advance: 1,
            }
        }
    ]);
    const properties = Object.assign(Object.assign({}, property), { rate_plan: rateplan });
    if (!properties) {
        return next(new appError_1.AppError(`No property found with this id ${propertyId}`, 404));
    }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property fetched successfully",
        data: properties,
    });
}));
exports.getPropertyInfoById = getPropertyInfoById;
const getAllProperty = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1];
    const deToken = yield (0, jwtHelper_1.decodeToken)(token, process.env.JWT_SECRET_KEY);
    const properties = yield property_info_model_1.PropertyInfo.find({ user_Id: deToken.id });
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property fetched successfully",
        totalProperty: properties.length,
        data: properties,
    });
}));
exports.getAllProperty = getAllProperty;
const getProperties = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const property = yield property_info_model_1.PropertyInfo.find();
    if (!property) {
        return next(new appError_1.AppError(`No property found with this id `, 404));
    }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property  fetched successfully",
        length: property.length,
        data: property.reverse(),
    });
}));
exports.getProperties = getProperties;
const deleteProperty = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyInfoId = req.params.id;
    const property = yield property_info_model_1.PropertyInfo.findById(propertyInfoId);
    if (!property) {
        return next(new appError_1.AppError(`No property found with this id ${property}`, 404));
    }
    yield Promise.all([
        property_address_model_1.PropertyAddress.findByIdAndDelete(property === null || property === void 0 ? void 0 : property.property_address),
        propertyamenite_model_1.propertyAminity.findByIdAndDelete(property === null || property === void 0 ? void 0 : property.property_amenities),
        room_amenite_model_1.RoomAminity.findByIdAndDelete(property === null || property === void 0 ? void 0 : property.room_Aminity),
        ratePlan_model_1.default.findByIdAndDelete(property === null || property === void 0 ? void 0 : property.rate_plan),
    ]);
    yield property_info_model_1.PropertyInfo.findByIdAndDelete(propertyInfoId);
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property deleted successfully",
        data: null,
    });
}));
exports.deleteProperty = deleteProperty;
//# sourceMappingURL=propertyInfo.controller.js.map