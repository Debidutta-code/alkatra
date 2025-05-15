import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { Room } from "../model/room.model";
import { PropertyInfo } from "../model/property.info.model";
import PropertyRatePlan from "../model/ratePlan.model";
import mongoose from "mongoose";
import PropertyPrice from "../model/ratePlan.model";
import RoomType, { IRoomType } from "../model/roomType.model";
import RatePlan from "../model/ratePlan.model";


interface UpdateFields {
  room_name?: string;
  room_type?: string;
  total_room?: number;
  floor?: number;
  room_view?: string;
  room_size?: number;
  room_unit?: String;
  smoking_policy?: string;
  max_occupancy?: number;
  max_number_of_adults?: number;
  max_number_of_children?: number;
  number_of_bedrooms?: number;
  number_of_living_room?: number;
  extra_bed?: number;
  description?: string;
  image?: string[];
  available?: boolean;
}

// create room
const createRoom = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const {
    room_name,
    room_type,
    total_room,
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
  } = req.body;

  if (!id) {
    next(new AppError("Property Id is required", 400));
  }
  if (!req.body) {
    next(new AppError("Please fill all the required fields", 400));
  }
  const matchedRoomType = await RoomType.findOne({ name: room_type });
  if (!matchedRoomType) {
    return next(new AppError("Room type not found in database", 404));
  }

  // create new room
  const newRoom = await Room.create({
    propertyInfo_id: id,
    room_name,
    room_type,
    room_type_code: matchedRoomType.code,
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
  const property = await PropertyInfo.findByIdAndUpdate({ _id: id },
    {
      $push: { property_room: newRoom._id }
    },
    { new: true }
  );

  res.status(201).json({
    status: "success",
    error: false,
    message: "Room registered successfully",
    new_room: newRoom,
  });
}
);

// update room
const updateRoom = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const roomId = req.query.roomId
  const {
    room_name,
    room_type,
    total_room,
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
  } = req.body;

  if (!roomId) {
    return next(new AppError("Room Id is required", 400));
  }
  if (!req.body) {
    return next(new AppError("Please provide all the required details", 400));
  }

  const updateFields: UpdateFields = {};
  if (room_name) updateFields.room_name = room_name;
  if (room_type) updateFields.room_type = room_type;
  if (total_room) updateFields.total_room = total_room;
  if (floor) updateFields.floor = floor;
  if (room_view) updateFields.room_view = room_view;
  if (room_size) updateFields.room_size = room_size;
  if (room_unit) updateFields.room_unit = room_unit;
  if (smoking_policy) updateFields.smoking_policy = smoking_policy;
  if (max_occupancy) updateFields.max_occupancy = max_occupancy;
  if (max_number_of_adults) updateFields.max_number_of_adults = max_number_of_adults;
  if (max_number_of_children) updateFields.max_number_of_children = max_number_of_children;
  if (number_of_bedrooms) updateFields.number_of_bedrooms = number_of_bedrooms;
  if (number_of_living_room) updateFields.number_of_living_room = number_of_living_room;
  if (extra_bed) updateFields.extra_bed = extra_bed;
  if (description) updateFields.description = description;
  if (image) updateFields.image = image;
  if (available) updateFields.available = available;

  const updatedroom = await Room.findByIdAndUpdate(
    roomId,
    { $set: updateFields },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    error: false,
    message: "Room updated successfully",
    updated_room: updatedroom,
  });
}
);

const deleteRoom = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("Room Id is required", 400));
  }

  await PropertyRatePlan.findOneAndDelete({ applicable_room_type: id })

  // check if room exists with the given id
  const room = await Room.findById(id);
  if (!room) {
    return next(
      new AppError(`No property found with this id ${id}`, 404)
    );
  }
  // delete room
  await Room.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    error: false,
    message: "Room deleted successfully"
  });
}
);

const getRoomById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  if (!id) {
    return next(new AppError("Room Id is required", 400));
  }

  // console.log("Room: ", await Room.find({ propertyInfo_id: id }));

  const room = await Room.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },

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
  ])

  console.log("getRoomById: ", room)

  if (!room) {
    return next(
      new AppError(`No property found with this id ${id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    error: false,
    message: "Room fetched successfully",
    data: room,
  });
}
);

const getRooms = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const rooms = await Room.find();

  res.status(200).json({
    status: "success",
    error: false,
    message: "Rooms fetched successfully",
    totalRooms: rooms.length,
    data: rooms,
  });
}
);

const getRoomsByPropertyId = catchAsync(async (req: Request<unknown, unknown>, res: Response, next: NextFunction) => {
  const propertyInfoId = req.params.id;
  const userId = req.user;
  const userRole = req.role;
  console.log("#################ROOM: The user id and role is: ", {userId, userRole});
  const rooms = await Room.find({ propertyInfo_id: propertyInfoId }).exec();
  console.log("Rooms: ", rooms)
  if (!rooms) {
    return next(
      new AppError(`No property found with this id ${propertyInfoId}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    error: false,
    message: "Room  fetched by property id successfully",
    data: rooms,
  });
})

// const getRoomsByPropertyId2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const propertyInfoId = req.params.id;

//   const rooms = await Room.find({ propertyInfo_id: propertyInfoId }).exec();
//   const ratePlanList = await PropertyPrice.find({ property_id: propertyInfoId });

//   if (!rooms) {
//     return next(
//       new AppError(`No property found with this id ${propertyInfoId}`, 404)
//     );
//   }
//   if (!ratePlanList || ratePlanList.length === 0) {
//     return next(
//       new AppError(`No rate plans found for property with id ${propertyInfoId}`, 404)
//     );
//   }

//   const roomsWithPrices = rooms.map((room) => {
//     const ratePlan = ratePlanList.find((ratePlan) => ratePlan.property_id.toString() === room.propertyInfo_id.toString());

//     return {
//       ...room.toObject(),
//       room_price: ratePlan ? ratePlan.room_price : null,
//       meal_plan: ratePlan ? ratePlan.meal_plan : null,
//       rateplan_id: ratePlan ? ratePlan._id : null
//     };
//   });
//   console.log("Rooms with Prices: ", roomsWithPrices);
//   res.status(200).json({
//     status: "success",
//     error: false,
//     message: "Rooms fetched by property id with rate plan successfully",
//     data: roomsWithPrices,
//   });
// });


export const getRoomsForBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const propertyInfoId = req.params.id;

  const rooms = await Room.aggregate([
    { $match: { propertyInfo_id: new mongoose.Types.ObjectId(propertyInfoId) } },

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
  ])
  console.log("Rooms: ", rooms)
  if (!rooms) {
    return next(
      new AppError(`No property found with this id ${propertyInfoId}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    error: false,
    message: "Room  fetched by property id successfully",
    data: rooms,
  });
})

export const createRoomType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, name, description } = req.body;
  if (!code || !name || !description) {
    return next(new AppError('Please provide code, name, and description.', 400));
  }
  const existing = await RoomType.findOne({ code: code.toUpperCase() });
  if (existing) {
    return next(new AppError('Room type code already exists.', 409));
  }
  const roomType: IRoomType = await RoomType.create({
    code: code.toUpperCase(),
    name,
    description,
  });
  res.status(201).json({
    status: 'success',
    data: roomType,
    message: 'Room type created successfully',
  });
});

export const getRoomTypes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const roomTypes = await RoomType.find();

  if (!roomTypes || roomTypes.length === 0) {
    return next(new AppError('No room types found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: roomTypes,
    message: 'Room types retrieved successfully',
  });
});

export const assignRatePlansToRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { property_id, room_ids, rate_plan_ids } = req.body;
    // Basic validation
    if (!property_id || !room_ids || !rate_plan_ids) {
      return res.status(400).json({
        success: false,
        message: "property_id, room_ids and rate_plan_ids are required",
      });
    }
    // Normalize to arrays
    const roomIds = Array.isArray(room_ids) ? room_ids : [room_ids];
    const ratePlanIds = Array.isArray(rate_plan_ids) ? rate_plan_ids : [rate_plan_ids];
    // Validate property
    const propertyExists = await PropertyInfo.findById(property_id);
    if (!propertyExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid property ID",
      });
    }
    // Validate rooms
    const validRooms = await Room.find({ _id: { $in: roomIds }, propertyInfo_id: property_id });
    if (validRooms.length !== roomIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more room IDs are invalid or do not belong to the property",
      });
    }
    // Validate rate plans
    const validRatePlans = await RatePlan.find({ _id: { $in: ratePlanIds }, propertyId: property_id });
    if (validRatePlans.length !== ratePlanIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more rate plan IDs are invalid or do not belong to the property",
      });
    }
    // Update each room: add rate plans without duplicates
    const updatePromises = roomIds.map((roomId) =>
      Room.findByIdAndUpdate(
        roomId,
        { $addToSet: { rate_plan_ids: { $each: ratePlanIds } } },
        { new: true }
      )
    );
    const updatedRooms = await Promise.all(updatePromises);
    return res.status(200).json({
      success: true,
      message: "Rate plan(s) successfully assigned to room(s)",
      updatedRooms,
    });
  } catch (error: any) {
    console.error("Error assigning rate plans to rooms:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export { createRoom, updateRoom, deleteRoom, getRoomById, getRooms, getRoomsByPropertyId };