import mongoose from "mongoose";
import { PropertyInfo } from "../model/property.info.model";
import { Room } from "../model/room.model";
import { Inventory } from "../../../wincloud/src/model/inventoryModel";
import RateAmountDateWise from "../../../wincloud/src/model/ratePlanDateWise.model";
import { DeepLinkModel } from "../model/deepLink.model";
import { ObjectId } from "mongoose";

export class RoomRepository {

    async checkRoomsAvailability(hotelCode: string, roomTypes: string[], startDate: Date, endDate: Date, numberOfRooms: number) {
        return Inventory.find({
            hotelCode,
            invTypeCode: { $in: roomTypes },
            startDate: { $gte: startDate, $lte: endDate },
            'availability.count': { $lt: numberOfRooms },
            status: "open",
        });
    }

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
            'availability.count': { $gte: numberOfRooms },
            status: "open",
        });
    }

    async storeDeepLinkData(
        couponCode: String,
        startDate: String,
        endDate: String,
        hotelCode: String,
        guestDetails,
        getPropertyDetails) {

        if (!couponCode || !startDate || !endDate || !hotelCode || !guestDetails || !getPropertyDetails) {
            throw new Error("Required details are not found for storing in Deep link model");
        }
        const deepLinkDataStore = await DeepLinkModel.create({
            couponCode,
            startDate,
            endDate,
            hotelCode,
            guestDetails,
            hotelDetails: getPropertyDetails,
        })
        if (!deepLinkDataStore) {
            throw new Error("Data stored in deep link model unsuccessful");
        }
        const newDeepLinkDataId = deepLinkDataStore._id;
        return newDeepLinkDataId;

    }

    async getDeepLinkData(deepLinkId: string) {
        if (!deepLinkId) {
            throw new Error("Deep link id not found in service");
        }
        console.log(`The deep link data we get from service ${deepLinkId}`);
        const ObjectConvertedDeepLinkData = new mongoose.Types.ObjectId(deepLinkId);

        const deepLinkData = await DeepLinkModel.findOne({ _id: ObjectConvertedDeepLinkData });

        if (!deepLinkData) {
            throw new Error(`Deep link data not found with this ${deepLinkId}`);
        }
        return deepLinkData;
    }

    /**
     * Get basic room information
     */
    async getRoomsByPropertyAndTypes(propertyInfoId: string, availableRoomTypes: string[]) {
        return Room.find({
            propertyInfo_id: new mongoose.Types.ObjectId(propertyInfoId),
            room_type: { $in: availableRoomTypes }
        });
    }

    /**
     * Get rate information for specific rooms and date range
    */
    async getRateInfoForRooms(hotelCode: string, roomTypes: string[], startDate: Date, endDate: Date) {

        const datePairs = [];
        let currentDate = new Date(startDate);

        while (currentDate < endDate) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);

            datePairs.push({
                startDate: new Date(currentDate),
                endDate: nextDate
            });

            currentDate = nextDate;
        }


        const requiredStartDates = datePairs.map(pair => pair.startDate);


        const rates = await RateAmountDateWise.find({
            hotelCode: hotelCode,
            invTypeCode: { $in: roomTypes },
            startDate: { $in: requiredStartDates }
        }).sort({ startDate: 1 });


        const foundStartDates = new Set(rates.map(rate => rate.startDate.toISOString()));
        const missingDates = requiredStartDates.filter(date => !foundStartDates.has(date.toISOString()));

        if (missingDates.length > 0) {
            const missingDatesStr = missingDates.map(d => d.toISOString().split("T")[0]).join(", ");
            throw new Error(`Missing rate data for the following dates: ${missingDatesStr}`);
        }

        return rates;
    }

    /**
     * Get inventory information for specific rooms and date range
    */
    async getInventoryInfoForRooms(hotelCode: string, roomTypes: string[], startDate: Date, endDate: Date) {

        const dateList: Date[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateList.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const result = await Inventory.aggregate([
            {
                $match: {
                    hotelCode: hotelCode,
                    invTypeCode: { $in: roomTypes },
                    "availability.startDate": { $in: dateList },
                }
            },
            {
                $group: {
                    _id: {
                        invTypeCode: "$invTypeCode",
                        startDate: "$availability.startDate"
                    },
                    minAvailableRooms: { $min: "$availability.count" }
                }
            },
            {
                $project: {
                    _id: 0,
                    invTypeCode: "$_id.invTypeCode",
                    startDate: "$_id.startDate",
                    minAvailableRooms: 1
                }
            }
        ]);


        if (!result.length) {
            throw new Error(
                `No data found for between ${start.toISOString().split("T")[0]} and ${end.toISOString().split("T")[0]}`
            );
        }

        return result;
    }


    async getRoomsWithRates(propertyInfoId: string, availableRoomTypes: string[], hotelCode: string, startDate: Date, endDate: Date) {

        // Step 1: Get basic room data
        const rooms = await this.getRoomsByPropertyAndTypes(propertyInfoId, availableRoomTypes);

        if (!rooms.length) {
            return [];
        }

        // Step 2: Get rate information for all room types
        const rateInfo = await this.getRateInfoForRooms(hotelCode, availableRoomTypes, startDate, endDate);

        // Step 3: Get inventory information
        const inventoryInfo = await this.getInventoryInfoForRooms(hotelCode, availableRoomTypes, startDate, endDate);

        // Step 4: Combine the data
        const roomsWithRates = rooms.map(room => {
            // Find rate info for this room type
            const roomRates = rateInfo.filter(rate => rate.invTypeCode === room.room_type);

            // Find inventory info for this room type
            const roomInventory = inventoryInfo.find(inv => inv._id === room.room_type);

            // Get the first rate (you might want to aggregate multiple rates differently)
            const firstRate = roomRates[0];

            return {
                // Basic room information
                _id: room._id,
                propertyInfo_id: room.propertyInfo_id,
                room_name: room.room_name,
                room_type: room.room_type,
                total_room: room.total_room,
                floor: room.floor,
                room_view: room.room_view,
                room_size: room.room_size,
                room_unit: room.room_unit,
                smoking_policy: room.smoking_policy,
                max_occupancy: room.max_occupancy,
                max_number_of_adults: room.max_number_of_adults,
                max_number_of_children: room.max_number_of_children,
                number_of_bedrooms: room.number_of_bedrooms,
                number_of_living_room: room.number_of_living_room,
                extra_bed: room.extra_bed,
                description: room.description,
                image: room.image,
                available: room.available,
                rateplan_created: room.rateplan_created,

                // Rate information (from first rate found)
                hotelCode: firstRate?.hotelCode || null,
                hotelName: firstRate?.hotelName || null,
                ratePlanCode: firstRate?.ratePlanCode || null,
                startDate: firstRate?.startDate || null,
                endDate: firstRate?.endDate || null,
                days: firstRate?.days || null,
                currencyCode: firstRate?.currencyCode || null,
                baseByGuestAmts: firstRate?.baseByGuestAmts || null,
                additionalGuestAmounts: firstRate?.additionalGuestAmounts || null,

                // Calculated fields
                room_price: firstRate?.baseByGuestAmts?.[0]?.amountBeforeTax
                    ? Math.round(firstRate.baseByGuestAmts[0].amountBeforeTax * 100) / 100
                    : null,
                currency_code: firstRate?.currencyCode || null,
                rate_plan_code: firstRate?.ratePlanCode || null,
                available_guest_rates: firstRate?.baseByGuestAmts || null,
                additional_guest_amounts: firstRate?.additionalGuestAmounts || null,

                // Inventory information
                available_rooms: roomInventory?.minAvailableRooms || 0,

                // Validation flags
                has_valid_rate: roomRates.length > 0,
                all_rates: roomRates // Include all rates for debugging/advanced usage
            };
        });

        // Filter out rooms without valid rates
        return roomsWithRates.filter(room => room.has_valid_rate);
    }

    async getRoomsWithCompleteRates(propertyInfoId: string, availableRoomTypes: string[], hotelCode: string, startDate: Date, endDate: Date) {

        const rooms = await this.getRoomsByPropertyAndTypes(propertyInfoId, availableRoomTypes);

        if (!rooms.length) {
            return [];
        }

        // Calculate total days needed
        const totalDaysNeeded = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const rateInfo = await this.getRateInfoForRooms(hotelCode, availableRoomTypes, startDate, endDate);
        const inventoryInfo = await this.getInventoryInfoForRooms(hotelCode, availableRoomTypes, startDate, endDate);

        const roomsWithCompleteRates = rooms.map(room => {
            const roomRates = rateInfo.filter(rate => rate.invTypeCode === room.room_type);
            const roomInventory = inventoryInfo.find(inv => inv._id === room.room_type);

            // Check if we have rates for all required days
            const hasCompleteRates = roomRates.length >= totalDaysNeeded;

            if (!hasCompleteRates) {
                return null; // Skip rooms without complete rate coverage
            }

            // Calculate total price for the stay
            const totalPrice = roomRates.reduce((total, rate) => {
                return total + (rate.baseByGuestAmts?.[0]?.amountBeforeTax || 0);
            }, 0);

            const firstRate = roomRates[0];

            return {
                ...room.toObject(),

                // Rate information
                hotelCode: firstRate?.hotelCode,
                hotelName: firstRate?.hotelName,
                ratePlanCode: firstRate?.ratePlanCode,
                currencyCode: firstRate?.currencyCode,

                // Pricing
                daily_rate: firstRate?.baseByGuestAmts?.[0]?.amountBeforeTax || 0,
                total_price: Math.round(totalPrice * 100) / 100,
                currency_code: firstRate?.currencyCode,

                // Inventory
                available_rooms: roomInventory?.minAvailableRooms || 0,

                // Validation
                has_complete_rates: true,
                rate_days_covered: roomRates.length,
                all_rates: roomRates
            };
        }).filter(room => room !== null);

        return roomsWithCompleteRates;
    }

}
