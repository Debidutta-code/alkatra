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
exports.deleteRoomAmenity = exports.getRoomAminity = exports.updateRoomAmenity = exports.createRoomAminity = void 0;
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
const room_amenite_model_1 = require("../model/room.amenite.model");
const property_info_model_1 = require("../model/property.info.model");
const room_model_1 = require("../model/room.model");
const createRoomAminity = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { propertyInfo_id, room_type, amenities } = req.body;
        console.log("###################\nIncoming creating amenities", req.body);
        if (!req.body) {
            next(new appError_1.AppError("Please fill all the required fields", 400));
        }
        const roomTypeDetails = yield room_model_1.Room.find({
            propertyInfo_id,
            room_type,
        });
        if (roomTypeDetails.length === 0) {
            return next(new appError_1.AppError(`No room found with ${propertyInfo_id} type ${room_type} for this property`, 404));
        }
        const roomAminitycreate = yield room_amenite_model_1.RoomAminity.create({
            propertyInfo_id,
            room_type,
            amenities,
        });
        const updatedInfo = yield property_info_model_1.PropertyInfo.findByIdAndUpdate(propertyInfo_id, room_type, { room_Aminity: roomAminitycreate._id });
        if (!updatedInfo) {
            throw new appError_1.AppError("PropertyInfo not found", 404);
        }
        console.log("PropertyInfo updated:", updatedInfo);
        console.log("roomAminityInfo updated:", roomAminitycreate);
        res.status(201).json({
            status: "success",
            error: false,
            message: "Room Aminity registered successfully",
            data: roomAminitycreate,
            propertyinfo: updatedInfo,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.createRoomAminity = createRoomAminity;
const updateRoomAmenity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { propertyInfo_id, room_type, amenities } = req.body;
        console.log("========= Incoming Data =========");
        console.log("PropertyInfo ID:", propertyInfo_id);
        console.log("Room Type:", room_type);
        console.log("Amenities:", amenities);
        console.log("=================================");
        if (!req.body) {
            next(new appError_1.AppError("Please fill all the required fields", 400));
        }
        const updatedRoomAminity = yield room_amenite_model_1.RoomAminity.findOneAndUpdate({ propertyInfo_id, room_type }, { $set: { amenities } }, { new: true });
        console.log("updatedRoomAminity:", updatedRoomAminity);
        return res.json({
            success: true,
            updatedRoomAminity
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.updateRoomAmenity = updateRoomAmenity;
const getRoomAminity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyInfo_id = req.params.id;
        const room_type = req.query.room_type;
        console.log('Property ID:', propertyInfo_id);
        console.log('Room Type:', room_type);
        if (!propertyInfo_id) {
            return next(new appError_1.AppError('Please provide propertyInfo_id', 400));
        }
        let roomAminities;
        if (room_type) {
            roomAminities = yield room_amenite_model_1.RoomAminity.findOne({ propertyInfo_id, room_type }).lean();
            if (!roomAminities) {
                return next(new appError_1.AppError(`No amenities found for room type "${room_type}" in property ${propertyInfo_id}`, 404));
            }
        }
        else {
            roomAminities = yield room_amenite_model_1.RoomAminity.find({ propertyInfo_id }).lean();
            if (!roomAminities || roomAminities.length === 0) {
                return next(new appError_1.AppError(`No amenities found for property ${propertyInfo_id}`, 404));
            }
        }
        res.status(200).json({
            success: true,
            data: roomAminities,
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.getRoomAminity = getRoomAminity;
const deleteRoomAmenity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { propertyInfo_id, room_type } = req.body;
    if (!propertyInfo_id || !room_type) {
        return next(new appError_1.AppError("Please provide propertyInfo_id and room_type", 400));
    }
    const roomAminityDetails = yield room_amenite_model_1.RoomAminity.findOne({ propertyInfo_id, room_type });
    if (!roomAminityDetails) {
        return next(new appError_1.AppError(`No room amenity found for property ${propertyInfo_id} and room type ${room_type}`, 404));
    }
    // const roomAminityDetails = await RoomAminity.findOneAndDelete({ propertyInfo_id, room_type });
    // if (!roomAminityDetails) {
    //   return next(new AppError(`No room amenity found for property ${propertyInfo_id} and room type ${room_type}`, 404));
    // }
    res.status(200).json({
        status: "success",
        error: false,
        message: "Room amenity deleted successfully",
        data: roomAminityDetails,
    });
    console.log("Room amenity deleted successfully:", roomAminityDetails);
});
exports.deleteRoomAmenity = deleteRoomAmenity;
//# sourceMappingURL=room.aminity.js.map