import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { RoomAminity } from "../model/room.amenite.model";
import { PropertyInfo } from "../model/property.info.model";
import { Room } from "../model/room.model"


const createRoomAminity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { propertyInfo_id, room_type, amenities } = req.body;
      console.log("###################\nIncoming creating amenities",req.body);

      if (!req.body) {
        next(new AppError("Please fill all the required fields", 400));
      }

      const roomTypeDetails = await Room.find({
        propertyInfo_id,
        room_type,
      });      
      if (roomTypeDetails.length === 0) {
        return next(new AppError(`No room found with ${propertyInfo_id} type ${room_type} for this property`, 404));
      }

      const roomAminitycreate = await RoomAminity.create({
        propertyInfo_id,
        room_type,
        amenities,
      });

      const updatedInfo = await PropertyInfo.findByIdAndUpdate(
        propertyInfo_id,
        room_type,
        { room_Aminity: roomAminitycreate._id }
      );

      if (!updatedInfo) {
        throw new AppError("PropertyInfo not found", 404);
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
    } catch (error) {
      next(error);
    }
  }
);

// update room amenity
const updateRoomAmenity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyInfo_id, room_type, amenities } = req.body;
    console.log("========= Incoming Data =========");
    console.log("PropertyInfo ID:", propertyInfo_id);
    console.log("Room Type:", room_type);
    console.log("Amenities:", amenities);
    console.log("=================================");
    if (!req.body) {
      next(new AppError("Please fill all the required fields", 400));
    }

    const updatedRoomAminity = await RoomAminity.findOneAndUpdate(
      { propertyInfo_id, room_type },
      { $set: { amenities } },
      { new: true }
    );
    console.log("updatedRoomAminity:", updatedRoomAminity)

    return res.json({
      success: true,
      updatedRoomAminity
    })
  } 
  catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
    });
  }
}

const getRoomAminity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyInfo_id = req.params.id; 
    const room_type = req.params.room_type; 

    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$-property_id", propertyInfo_id);
    console.log("Room Type:", room_type);

    if (!propertyInfo_id) {
      return next(new AppError("Please provide propertyInfo_id", 400));
    }

    let roomAminity;

    if (room_type) {
      roomAminity = await RoomAminity.findOne({ propertyInfo_id, room_type }).lean();
      if (!roomAminity) {
        return next(new AppError(`No amenities found for room type "${room_type}" in property ${propertyInfo_id}`, 404));
      }
    } else {
      roomAminity = await RoomAminity.find({ propertyInfo_id }).lean();
      if (!roomAminity || roomAminity.length === 0) {
        return next(new AppError(`No amenities found for property ${propertyInfo_id}`, 404));
      }
    }

    res.status(200).json({
      success: true,
      data: roomAminity
    });
    
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
    });
  }
}

export { createRoomAminity, updateRoomAmenity, getRoomAminity };
