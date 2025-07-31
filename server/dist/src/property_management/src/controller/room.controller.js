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
exports.getRoomsForBooking = exports.getRoomsByPropertyId2 = exports.getRoomsByPropertyId = exports.getRooms = exports.getRoomById = exports.deleteRoom = exports.updateRoom = exports.getAllRoomTypes = exports.createRoom = void 0;
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
const room_model_1 = require("../model/room.model");
const property_info_model_1 = require("../model/property.info.model");
const ratePlan_model_1 = __importDefault(require("../model/ratePlan.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const qrcode_1 = __importDefault(require("qrcode"));
const couponService_1 = require("../../../coupon_management/services/couponService");
const RoomTypes_model_1 = __importDefault(require("../model/RoomTypes.model"));
const inventoryModel_1 = require("../../../wincloud/src/model/inventoryModel");
// create room
const createRoom = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { room_name, room_type, total_room, floor, room_view, room_size, room_unit, smoking_policy, max_occupancy, max_number_of_adults, max_number_of_children, number_of_bedrooms, number_of_living_room, extra_bed, description, image, available } = req.body;
    if (!id) {
        next(new appError_1.AppError("Property Id is required", 400));
    }
    if (!req.body) {
        next(new appError_1.AppError("Please fill all the required fields", 400));
    }
    // create new room
    const newRoom = yield room_model_1.Room.create({
        propertyInfo_id: id,
        room_name,
        room_type,
        total_room,
        available_rooms: total_room,
        floor,
        room_view,
        room_size,
        room_unit,
        smoking_policy,
        max_occupancy,
        max_number_of_adults,
        max_number_of_children,
        number_of_bedrooms,
        number_of_living_room,
        extra_bed,
        description,
        image,
        available
    });
    // update the propertyInfo model with the new room
    const property = yield property_info_model_1.PropertyInfo.findByIdAndUpdate({ _id: id }, {
        $push: { property_room: newRoom._id }
    }, { new: true });
    res.status(201).json({
        status: "success",
        error: false,
        message: "Room registered successfully",
        new_room: newRoom,
    });
}));
exports.createRoom = createRoom;
// update room
const updateRoom = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.query.roomId;
    const { room_name, room_type, total_room, floor, room_view, room_size, room_unit, smoking_policy, max_occupancy, max_number_of_adults, max_number_of_children, number_of_bedrooms, number_of_living_room, extra_bed, description, image, available } = req.body;
    if (!roomId) {
        return next(new appError_1.AppError("Room Id is required", 400));
    }
    if (!req.body) {
        return next(new appError_1.AppError("Please provide all the required details", 400));
    }
    const updateFields = {};
    if (room_name)
        updateFields.room_name = room_name;
    if (room_type)
        updateFields.room_type = room_type;
    if (total_room)
        updateFields.total_room = total_room;
    if (floor)
        updateFields.floor = floor;
    if (room_view)
        updateFields.room_view = room_view;
    if (room_size)
        updateFields.room_size = room_size;
    if (room_unit)
        updateFields.room_unit = room_unit;
    if (smoking_policy)
        updateFields.smoking_policy = smoking_policy;
    if (max_occupancy)
        updateFields.max_occupancy = max_occupancy;
    if (max_number_of_adults)
        updateFields.max_number_of_adults = max_number_of_adults;
    if (max_number_of_children)
        updateFields.max_number_of_children = max_number_of_children;
    if (number_of_bedrooms)
        updateFields.number_of_bedrooms = number_of_bedrooms;
    if (number_of_living_room)
        updateFields.number_of_living_room = number_of_living_room;
    if (extra_bed)
        updateFields.extra_bed = extra_bed;
    if (description)
        updateFields.description = description;
    if (image)
        updateFields.image = image;
    if (available)
        updateFields.available = available;
    const updatedroom = yield room_model_1.Room.findByIdAndUpdate(roomId, { $set: updateFields }, { new: true });
    res.status(200).json({
        status: "success",
        error: false,
        message: "Room updated successfully",
        updated_room: updatedroom,
    });
}));
exports.updateRoom = updateRoom;
const deleteRoom = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return next(new appError_1.AppError("Room Id is required", 400));
    }
    yield ratePlan_model_1.default.findOneAndDelete({ applicable_room_type: id });
    // check if room exists with the given id
    const room = yield room_model_1.Room.findById(id);
    if (!room) {
        return next(new appError_1.AppError(`No property found with this id ${id}`, 404));
    }
    // delete room
    yield room_model_1.Room.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        error: false,
        message: "Room deleted successfully"
    });
}));
exports.deleteRoom = deleteRoom;
const getRoomById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        return next(new appError_1.AppError("Room Id is required", 400));
    }
    const room = yield room_model_1.Room.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
        {
            $lookup: {
                from: "rateplans",
                localField: "propertyInfo_id",
                foreignField: "property_id",
                as: "room_price"
            }
        },
        { $unwind: "$room_price" },
        {
            $project: {
                // roomDetails: "$$ROOT",
                propertyInfo_id: 1,
                room_name: 1,
                room_type: 1,
                total_room: 1,
                available_rooms: 1,
                floor: 1,
                room_view: 1,
                room_size: 1,
                room_unit: 1,
                smoking_policy: 1,
                max_occupancy: 1,
                max_number_of_adults: 1,
                max_number_of_children: 1,
                number_of_bedrooms: 1,
                number_of_living_room: 1,
                extra_bed: 1,
                description: 1,
                image: 1,
                room_price: "$room_price.room_price",
                meal_plan: "$room_price.meal_plan",
                rateplan_id: "$room_price._id",
            }
        }
    ]);
    console.log("getRoomById: ", room);
    if (!room) {
        return next(new appError_1.AppError(`No property found with this id ${id}`, 404));
    }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Room fetched successfully",
        data: room,
    });
}));
exports.getRoomById = getRoomById;
const getRooms = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield room_model_1.Room.find();
    res.status(200).json({
        status: "success",
        error: false,
        message: "Rooms fetched successfully",
        totalRooms: rooms.length,
        data: rooms,
    });
}));
exports.getRooms = getRooms;
const getRoomsByPropertyId = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyInfoId = req.params.id;
    const rooms = yield room_model_1.Room.find({ propertyInfo_id: propertyInfoId }).exec();
    console.log("Rooms: ", rooms);
    if (!rooms) {
        return next(new appError_1.AppError(`No property found with this id ${propertyInfoId}`, 404));
    }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Room  fetched by property id successfully",
        data: rooms,
    });
}));
exports.getRoomsByPropertyId = getRoomsByPropertyId;
const getRoomsByPropertyId2 = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Entering into getRoomsByPropertyId2 controller");
    const propertyInfoId = req.params.id;
    const numberOfRooms = parseInt(req.query.numberOfRooms);
    let { startDate, endDate, hotelCode } = req.body;
    if (!startDate || !endDate || !hotelCode || !propertyInfoId || !numberOfRooms) {
        return next(new appError_1.AppError("Required fields are missing", 400));
    }
    console.log(`The data get from UI: ${startDate}, ${endDate}, ${hotelCode}`);
    // 1. match Property Id with property details schema
    const propertyDetails = yield property_info_model_1.PropertyInfo.findById(propertyInfoId);
    if (!propertyDetails || propertyDetails.property_code !== hotelCode) {
        return next(new appError_1.AppError(`Property not found or propertycode mismatch`, 404));
    }
    // 2. Match Room
    const room = yield room_model_1.Room.find({ propertyInfo_id: propertyInfoId });
    if (!room) {
        return res.status(404).json({
            status: "fail",
            error: true,
            message: "No room found with given property ID and room type"
        });
    }
    const roomTypes = room.map(r => r.room_type);
    // Date validation
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return next(new appError_1.AppError("Invalid date format for startDate or endDate", 400));
    }
    const normalizedStartDate = new Date(Date.UTC(parsedStartDate.getUTCFullYear(), parsedStartDate.getUTCMonth(), parsedStartDate.getUTCDate()));
    const normalizedEndDate = new Date(Date.UTC(parsedEndDate.getUTCFullYear(), parsedEndDate.getUTCMonth(), parsedEndDate.getUTCDate()));
    if (normalizedStartDate > normalizedEndDate) {
        return next(new appError_1.AppError("startDate cannot be after endDate", 400));
    }
    // 2. Check Inventory for all dates in range
    const dateList = [];
    let current = new Date(normalizedStartDate);
    while (current <= normalizedEndDate) {
        dateList.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    for (const date of dateList) {
        const roomAvailability = yield inventoryModel_1.Inventory.find({
            hotelCode,
            invTypeCode: { $in: roomTypes },
            'availability.startDate': date,
            'availability.count': { $gte: numberOfRooms }
        });
        if (!roomAvailability) {
            return next(new appError_1.AppError(`No availability on ${date.toISOString().split('T')[0]} for ${numberOfRooms} rooms`, 400));
        }
    }
    const roomsWithRates = yield room_model_1.Room.aggregate([
        {
            $match: {
                propertyInfo_id: new mongoose_1.default.Types.ObjectId(propertyInfoId),
                room_type: { $in: roomTypes }
            }
        },
        {
            $lookup: {
                from: "rateamountdatewises",
                let: {
                    roomType: "$room_type",
                    hotelCode: hotelCode,
                    start: normalizedStartDate,
                    end: new Date(normalizedStartDate.getTime() + 24 * 60 * 60 * 1000)
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$hotelCode", "$$hotelCode"] },
                                    { $eq: ["$invTypeCode", "$$roomType"] },
                                    {
                                        $and: [
                                            { $gte: ["$startDate", "$$start"] },
                                            { $lt: ["$startDate", "$$end"] }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    { $sort: { startDate: 1 } },
                    { $limit: 1 },
                ],
                as: "rateInfo"
            }
        },
        {
            $lookup: {
                from: "inventories",
                let: {
                    roomType: "$room_type",
                    hotelCode: hotelCode,
                    start: normalizedStartDate,
                    end: new Date(normalizedStartDate.getTime() + 24 * 60 * 60 * 1000)
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$hotelCode", "$$hotelCode"] },
                                    { $eq: ["$invTypeCode", "$$roomType"] },
                                    {
                                        $and: [
                                            { $eq: ["$startDate", "$$start"] },
                                            // { $lt: ["$startDate", "$$end"] }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$invTypeCode",
                            minAvailableRooms: { $min: "$availability.count" }
                        }
                    }
                ],
                as: "inventoryInfo"
            }
        },
        {
            $addFields: {
                available_rooms: {
                    $ifNull: [{ $arrayElemAt: ["$inventoryInfo.minAvailableRooms", 0] }, 0]
                },
            }
        },
        {
            $project: {
                _id: 1,
                propertyInfo_id: 1,
                room_name: 1,
                room_type: 1,
                total_room: 1,
                // available_rooms: 1,
                floor: 1,
                room_view: 1,
                room_size: 1,
                room_unit: 1,
                smoking_policy: 1,
                max_occupancy: 1,
                max_number_of_adults: 1,
                max_number_of_children: 1,
                number_of_bedrooms: 1,
                number_of_living_room: 1,
                extra_bed: 1,
                description: 1,
                image: 1,
                available: 1,
                rateplan_created: 1,
                // Rate information from RateAmountDateWise
                hotelCode: { $arrayElemAt: ["$rateInfo.hotelCode", 0] },
                hotelName: { $arrayElemAt: ["$rateInfo.hotelName", 0] },
                ratePlanCode: { $arrayElemAt: ["$rateInfo.ratePlanCode", 0] },
                startDate: { $arrayElemAt: ["$rateInfo.startDate", 0] },
                endDate: { $arrayElemAt: ["$rateInfo.endDate", 0] },
                days: { $arrayElemAt: ["$rateInfo.days", 0] },
                currencyCode: { $arrayElemAt: ["$rateInfo.currencyCode", 0] },
                baseByGuestAmts: { $arrayElemAt: ["$rateInfo.baseByGuestAmts", 0] },
                additionalGuestAmounts: { $arrayElemAt: ["$rateInfo.additionalGuestAmounts", 0] },
                // Getting room price
                room_price: {
                    $let: {
                        vars: {
                            firstRate: { $arrayElemAt: ["$rateInfo", 0] }
                        },
                        in: {
                            $round: [
                                {
                                    $arrayElemAt: ["$$firstRate.baseByGuestAmts.amountBeforeTax", 0]
                                },
                                2
                            ]
                        }
                    }
                },
                currency_code: { $arrayElemAt: ["$rateInfo.currencyCode", 0] },
                rate_plan_code: { $arrayElemAt: ["$rateInfo.ratePlanCode", 0] },
                available_guest_rates: { $arrayElemAt: ["$rateInfo.baseByGuestAmts", 0] },
                additional_guest_amounts: { $arrayElemAt: ["$rateInfo.additionalGuestAmounts", 0] },
                has_valid_rate: { $gt: [{ $size: "$rateInfo" }, 0] },
            }
        }
    ]);
    if (!roomsWithRates || roomsWithRates.length === 0) {
        return res.status(400).json({
            status: "fail",
            error: true,
            message: `No room rates found for selected range: ${startDate} to ${endDate}`
        });
    }
    // Generate coupon and QR
    const couponCode = yield (0, couponService_1.generateCouponCode)();
    const deepLinkUrl = `${process.env.DEEP_LINK}/property/${propertyInfoId}?coupon=${couponCode.code}&startDate=${startDate}&endDate=${endDate}$hotelCode=${hotelCode}`;
    const qrCodeData = yield qrcode_1.default.toDataURL(deepLinkUrl);
    res.status(200).json({
        status: "success",
        error: false,
        message: "Rooms fetched successfully",
        data: roomsWithRates,
        qrCode: qrCodeData,
        couponCode: couponCode.code,
        deepLink: deepLinkUrl,
        searchCriteria: {
            startDate,
            endDate,
            propertyId: propertyInfoId,
            hotelCode,
        },
    });
}));
exports.getRoomsByPropertyId2 = getRoomsByPropertyId2;
const getRoomsForBooking = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyInfoId = req.params.id;
    const rooms = yield room_model_1.Room.aggregate([
        { $match: { propertyInfo_id: new mongoose_1.default.Types.ObjectId(propertyInfoId) } },
        {
            $lookup: {
                from: "rateplans",
                localField: "propertyInfo_id",
                foreignField: "property_id",
                as: "room_price"
            }
        },
        {
            $project: {
                propertyInfo_id: 1,
                room_name: 1,
                room_type: 1,
                total_room: 1,
                available_rooms: 1,
                floor: 1,
                room_view: 1,
                room_size: 1,
                room_unit: 1,
                smoking_policy: 1,
                max_occupancy: 1,
                max_number_of_adults: 1,
                max_number_of_children: 1,
                number_of_bedrooms: 1,
                number_of_living_room: 1,
                extra_bed: 1,
                description: 1,
                image: 1,
                room_price: "$room_price.room_price",
                meal_plan: "$room_price.meal_plan",
                rateplan_id: "$room_price._id",
            }
        }
    ]);
    console.log("Rooms: ", rooms);
    if (!rooms) {
        return next(new appError_1.AppError(`No property found with this id ${propertyInfoId}`, 404));
    }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Room  fetched by property id successfully",
        data: rooms,
    });
}));
exports.getRoomsForBooking = getRoomsForBooking;
const getAllRoomTypes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield RoomTypes_model_1.default.find().exec();
        return res.status(200).json({ data: response, success: true });
    }
    catch (error) {
        return res.status(200).json({ success: false, message: "Error occur while getting all the roomTypes", error: error.message });
    }
}));
exports.getAllRoomTypes = getAllRoomTypes;
//# sourceMappingURL=room.controller.js.map