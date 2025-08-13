import mongoose from "mongoose";
import { PropertyInfo } from "../model/property.info.model";
import { Room } from "../model/room.model";
import { Inventory } from "../../../wincloud/src/model/inventoryModel";
import RateAmountDateWise from "../../../wincloud/src/model/ratePlanDateWise.model";

export class RoomRepository {

    async getPropertyById(propertyInfoId: string) {
        return PropertyInfo.findById(propertyInfoId);
    }

    async getRoomsByPropertyId(propertyInfoId: string) {
        return Room.find({ propertyInfo_id: propertyInfoId });
    }

    async checkRoomAvailability(hotelCode: string, roomType: string, date: Date, numberOfRooms: number) {
        return Inventory.findOne({
            hotelCode,
            invTypeCode: roomType,
            'availability.startDate': date,
            'availability.count': { $gte: numberOfRooms }
        });
    }

    async getRoomsWithRates(propertyInfoId: string, availableRoomTypes: string[], hotelCode: string, startDate: Date, endDate: Date) {
        return Room.aggregate([
            {
                $match: {
                    propertyInfo_id: new mongoose.Types.ObjectId(propertyInfoId),
                    room_type: { $in: availableRoomTypes }
                }
            },
            {
                $lookup: {
                    from: "rateamountdatewises",
                    let: { roomType: "$room_type", hotelCode, start: startDate, end: new Date(startDate.getTime() + 24 * 60 * 60 * 1000) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$hotelCode", "$$hotelCode"] },
                                        { $eq: ["$invTypeCode", "$$roomType"] },
                                        { $and: [{ $gte: ["$startDate", "$$start"] }, { $lt: ["$startDate", "$$end"] }] }
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
                    let: { roomType: "$room_type", hotelCode, start: startDate, end: new Date(endDate.getTime() + 24 * 60 * 60 * 1000) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$hotelCode", "$$hotelCode"] },
                                        { $eq: ["$invTypeCode", "$$roomType"] },
                                        { $and: [{ $gte: ["$startDate", "$$start"] }, { $lte: ["$startDate", "$$end"] }] }
                                    ]
                                }
                            }
                        },
                        { $group: { _id: "$invTypeCode", minAvailableRooms: { $min: "$availability.count" } } }
                    ],
                    as: "inventoryInfo"
                }
            },
            {
                $addFields: {
                    available_rooms: { $ifNull: [{ $arrayElemAt: ["$inventoryInfo.minAvailableRooms", 0] }, 0] }
                }
            },
            {
                $project: {
                    _id: 1, propertyInfo_id: 1, room_name: 1, room_type: 1,
                    total_room: 1, floor: 1, room_view: 1, room_size: 1, room_unit: 1,
                    smoking_policy: 1, max_occupancy: 1, max_number_of_adults: 1,
                    max_number_of_children: 1, number_of_bedrooms: 1, number_of_living_room: 1,
                    extra_bed: 1, description: 1, image: 1, available: 1, rateplan_created: 1,
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
                            vars: { firstRate: { $arrayElemAt: ["$rateInfo", 0] } },
                            in: { $round: [{ $arrayElemAt: ["$$firstRate.baseByGuestAmts.amountBeforeTax", 0] }, 2] }
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
    }
}
