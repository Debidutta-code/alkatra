import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { Room } from "../model/room.model";
import { PropertyInfo } from "../model/property.info.model";
import PropertyRatePlan from "../model/ratePlan.model";
import mongoose from "mongoose";
import QRCode from 'qrcode';
import { generateCouponCode } from "../../../coupon_management/services/couponService";
import RoomType from "../model/RoomTypes.model";
import { Inventory } from "../../../wincloud/src/model/inventoryModel";
import { PropertyDetails } from "../service";


const propertyDetailsService = new PropertyDetails();

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
  let { startDate, endDate, hotelCode } = req.body;
  // let {  }
  if (!startDate || !endDate || !hotelCode || !propertyInfoId || !numberOfRooms) {
    return next(new AppError("Required fields are missing", 400));
  }

  // 1. Match Property Id with property details schema 
  const propertyDetails = await PropertyInfo.findById(propertyInfoId);
  if (!propertyDetails || propertyDetails.property_code !== hotelCode) {
    return next(new AppError(`Property not found or property code mismatch`, 404));
  }

  // 2. Match Room
  const room = await Room.find({ propertyInfo_id: propertyInfoId });
  if (!room || room.length === 0) {
    return res.status(404).json({
      status: "fail",
      error: true,
      message: "No room found with given property ID"
    });
  }
  const roomTypes = room.map(r => r.room_type);

  // Date validation
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

  if (normalizedStartDate > normalizedEndDate) {
    return next(new AppError("startDate cannot be after endDate", 400));
  }

  // Create date list for the range
  const dateList: Date[] = [];
  let current = new Date(normalizedStartDate);
  while (current <= normalizedEndDate) {
    dateList.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Check inventory for all dates and room types
  const unavailableRoomTypes: { roomType: string; dates: string[] }[] = [];
  const availableRoomTypes: string[] = [];

  for (const roomType of roomTypes) {
    const unavailableDates: string[] = [];
    for (const date of dateList) {
      const roomAvailability = await Inventory.findOne({
        hotelCode,
        invTypeCode: roomType,
        'availability.startDate': date,
        'availability.count': { $gte: numberOfRooms }
      });

      if (!roomAvailability) {
        unavailableDates.push(date.toISOString().split('T')[0]);
      }
    }

    if (unavailableDates.length > 0) {
      unavailableRoomTypes.push({ roomType, dates: unavailableDates });
    } else {
      availableRoomTypes.push(roomType);
    }
  }

  if (availableRoomTypes.length === 0) {
    const errorMessage = unavailableRoomTypes
      .map(({ roomType, dates }) =>
        `Room type ${roomType} is unavailable on ${dates.join(', ')} for ${numberOfRooms} rooms`
      )
      .join('; ');
    return next(new AppError(errorMessage, 400));
  }

  // Fetch rooms with rates for available room types only
  const roomsWithRates = await Room.aggregate([
    {
      $match: {
        propertyInfo_id: new mongoose.Types.ObjectId(propertyInfoId),
        room_type: { $in: availableRoomTypes }
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
          { $limit: 1 }
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
          end: new Date(normalizedEndDate.getTime() + 24 * 60 * 60 * 1000)
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
                      { $lte: ["$startDate", "$$end"] }
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
        }
      }
    },
    {
      $project: {
        _id: 1,
        propertyInfo_id: 1,
        room_name: 1,
        room_type: 1,
        total_room: 1,
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
        hotelCode: { $arrayElemAt: ["$rateInfo.hotelCode", 0] },
        hotelName: { $arrayElemAt: ["$rateInfo.hotelName", 0] },
        ratePlanCode: { $arrayElemAt: ["$rateInfo.ratePlanCode", 0] },
        startDate: { $arrayElemAt: ["$rateInfo.startDate", 0] },
        endDate: { $arrayElemAt: ["$rateInfo.endDate", 0] },
        days: { $arrayElemAt: ["$rateInfo.days", 0] },
        currencyCode: { $arrayElemAt: ["$rateInfo.currencyCode", 0] },
        baseByGuestAmts: { $arrayElemAt: ["$rateInfo.baseByGuestAmts", 0] },
        additionalGuestAmounts: { $arrayElemAt: ["$rateInfo.additionalGuestAmounts", 0] },
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
        has_valid_rate: { $gt: [{ $size: "$rateInfo" }, 0] }
      }
    }
  ]);

  if (!roomsWithRates || roomsWithRates.length === 0) {
    return res.status(400).json({
      status: "fail",
      error: true,
      message: `No room rates found for selected range: ${startDate} to ${endDate} for available room types`
    });
  }

  // Generate coupon and QR
  const couponCode = await generateCouponCode();
  const guestDetails = req.query.guestDetails;
  const getPropertyDetails = await propertyDetailsService.getRoomsByPropertyIdService(propertyInfoId);

  const deepLinkUrl = `${process.env.DEEP_LINK}/property/${propertyInfoId}
    ?coupon=${couponCode.code}
    &startDate=${startDate}
    &endDate=${endDate}
    &hotelCode=${hotelCode}
    &guestDetails=${guestDetails}
    &hotelDetails=${getPropertyDetails}
  `;

  const qrCodeData = await QRCode.toDataURL(deepLinkUrl);

  res.status(200).json({
    status: "success",
    error: false,
    message: unavailableRoomTypes.length > 0
      ? `Rooms fetched successfully. Some room types unavailable: ${unavailableRoomTypes
        .map(({ roomType, dates }) => `${roomType} on ${dates.join(', ')}`)
        .join('; ')}`
      : "Rooms fetched successfully",
    data: roomsWithRates,
    qrCode: qrCodeData,
    couponCode: couponCode.code,
    deepLink: deepLinkUrl,
    searchCriteria: {
      startDate,
      endDate,
      propertyId: propertyInfoId,
      hotelCode
    },
    unavailableRoomTypes: unavailableRoomTypes.length > 0 ? unavailableRoomTypes : undefined
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
