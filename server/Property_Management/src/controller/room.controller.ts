import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { Room } from "../model/room.model";
import { PropertyInfo } from "../model/property.info.model";
import PropertyRatePlan from "../model/ratePlan.model";
import mongoose from "mongoose";
import PropertyPrice from "../model/ratePlan.model";
import QRCode from 'qrcode';
import { v4 as uuidv4 } from "uuid";
import { generateCouponCode } from "../../../Coupon_Management/services/couponService";
import RoomType from "../model/RoomTypes.model";
import { Inventory } from "../../../wincloud/src/model/inventoryModel";

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

interface RedirectParams {
  propertyId: string;
}

interface RedirectQuery {
  coupon?: string;
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

  // create new room
  const newRoom = await Room.create({
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

const getRoomsByPropertyId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const propertyInfoId = req.params.id;

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

const getRoomsByPropertyId2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const propertyInfoId = req.params.id;
  const numberOfRooms = parseInt(req.query.numberOfRooms as string);
  const { startDate, endDate, hotelCode = "WINCLOUD" } = req.body;

  if (!startDate || !endDate || !hotelCode || !propertyInfoId || !numberOfRooms) {
    return next(new AppError("Required fields are missing", 400));
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
    return next(new AppError("Invalid date format for startDate or endDate", 400));
  }

  const normalizedStartDate = new Date(Date.UTC(
    parsedStartDate.getUTCFullYear(),
    parsedStartDate.getUTCMonth(),
    parsedStartDate.getUTCDate()
  ));
  const normalizedEndDate = new Date(Date.UTC(
    parsedEndDate.getUTCFullYear(),
    parsedEndDate.getUTCMonth(),
    parsedEndDate.getUTCDate()
  ));

  // 1. Match Room
  const room = await Room.findOne({
    propertyInfo_id: propertyInfoId,
    room_type: { $regex: '^SUT$', $options: 'i' }
  });

  if (!room) {
    return res.status(404).json({
      status: "fail",
      error: true,
      message: "No room found with given property ID and room type"
    });
  }

  // 2. Check Inventory for all dates in range
  const dateList: Date[] = [];
  let current = new Date(normalizedStartDate);
  while (current <= normalizedEndDate) {
    dateList.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  for (const date of dateList) {
    const available = await Inventory.findOne({
      hotelCode,
      invTypeCode: { $regex: '^SUT$', $options: 'i' },
      'availability.startDate': date,
      'availability.count': { $gte: numberOfRooms }
    });

    if (!available) {
      return next(new AppError(`No availability on ${date.toISOString().split('T')[0]} for ${numberOfRooms} rooms`, 400));
    }
  }

  // 3. Fetch Room with rate info
  const roomsWithRates = await Room.aggregate([
    {
      $match: {
        propertyInfo_id: new mongoose.Types.ObjectId(propertyInfoId),
        room_type: { $regex: '^SUT$', $options: 'i' }
      }
    },
    {
      $lookup: {
        from: "rateamountdatewises",
        let: { roomType: "$room_type" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$invTypeCode", "$$roomType"] },
                  { $eq: ["$hotelCode", hotelCode] },
                  { $eq: ["$startDate", normalizedStartDate] }
                ]
              }
            }
          },
          { $sort: { startDate: 1 } },
          { $limit: 1 },
          {
            $project: {
              room_price: { $arrayElemAt: ["$baseByGuestAmts.amountBeforeTax", 0] },
              currency_code: "$currencyCode",
              rate_plan_code: "$ratePlanCode",
              available_guest_rates: "$baseByGuestAmts",
              rate_images: "$image"
            }
          }
        ],
        as: "rateInfo"
      }
    },
    {
      $project: {
        _id: 1,
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
        available: 1,
        rateplan_created: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        room_price: { $arrayElemAt: ["$rateInfo.room_price", 0] },
        currency_code: { $arrayElemAt: ["$rateInfo.currency_code", 0] },
        rate_plan_code: { $arrayElemAt: ["$rateInfo.rate_plan_code", 0] },
        available_guest_rates: { $arrayElemAt: ["$rateInfo.available_guest_rates", 0] },
        rate_images: { $arrayElemAt: ["$rateInfo.rate_images", 0] },
        has_valid_rate: { $gt: [{ $size: "$rateInfo" }, 0] }
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
  const couponCode = await generateCouponCode();
  const deepLinkUrl = `${process.env.DEEP_LINK}/property/${propertyInfoId}?coupon=${couponCode.code}&startDate=${startDate}&endDate=${endDate}`;
  const qrCodeData = await QRCode.toDataURL(deepLinkUrl);

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
});

const getRoomsForBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
});

const getAllRoomTypes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await RoomType.find().exec()
    return res.status(200).json({ data: response, success: true })
  } catch (error: any) {
    return res.status(200).json({ success: false, message: "Error occur while getting all the roomTypes", error: error.message })
  }
});

export { createRoom, getAllRoomTypes, updateRoom, deleteRoom, getRoomById, getRooms, getRoomsByPropertyId, getRoomsByPropertyId2, getRoomsForBooking };

