import QRCode from "qrcode";
import { RoomRepository } from "../repository";
import { AppError } from "../utils/appError";
import { generateCouponCode } from "../../../coupon_management/services/couponService";
import { PropertyDetails } from "./get.property.details.service";

const roomRepository = new RoomRepository();
const propertyDetailsService = new PropertyDetails();


export class RoomService {

    private roomRepository = new RoomRepository();

    async getRoomsByPropertyId(params: {
        propertyInfoId: string;
        numberOfRooms: number;
        startDate: string;
        endDate: string;
        hotelCode: string;
        guestDetails: string;
    }) {
        const { propertyInfoId, numberOfRooms, startDate, endDate, hotelCode, guestDetails } = params;

        // 1. Validate property
        const propertyDetails = await this.roomRepository.getPropertyById(propertyInfoId);
        if (!propertyDetails || propertyDetails.property_code !== hotelCode) {
            throw new AppError(`Property not found or property code mismatch`, 404);
        }

        // 2. Validate rooms
        const rooms = await this.roomRepository.getRoomsByPropertyId(propertyInfoId);
        if (!rooms.length) {
            throw new AppError("No room found with given property ID", 404);
        }
        const roomTypes = rooms.map(r => r.room_type);

        // 3. Validate dates
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            throw new AppError("Invalid date format for startDate or endDate", 400);
        }
        const normalizedStartDate = new Date(Date.UTC(parsedStartDate.getUTCFullYear(), parsedStartDate.getUTCMonth(), parsedStartDate.getUTCDate()));
        const normalizedEndDate = new Date(Date.UTC(parsedEndDate.getUTCFullYear(), parsedEndDate.getUTCMonth(), parsedEndDate.getUTCDate()));
        if (normalizedStartDate > normalizedEndDate) {
            throw new AppError("startDate cannot be after endDate", 400);
        }

        // 4. Check availability
        const dateList: Date[] = [];
        let current = new Date(normalizedStartDate);
        while (current <= normalizedEndDate) {
            dateList.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        const unavailableRoomTypes: { roomType: string; dates: string[] }[] = [];
        const availableRoomTypes: string[] = [];

        for (const roomType of roomTypes) {
            const unavailableDates: string[] = [];
            for (const date of dateList) {
                const roomAvailability = await this.roomRepository.checkRoomAvailability(hotelCode, roomType, date, numberOfRooms);
                if (!roomAvailability) {
                    unavailableDates.push(date.toISOString().split("T")[0]);
                }
            }
            if (unavailableDates.length) {
                unavailableRoomTypes.push({ roomType, dates: unavailableDates });
            } else {
                availableRoomTypes.push(roomType);
            }
        }

        if (!availableRoomTypes.length) {
            const errorMessage = unavailableRoomTypes
                .map(({ roomType, dates }) => `Room type ${roomType} is unavailable on ${dates.join(", ")} for ${numberOfRooms} rooms`)
                .join("; ");
            throw new AppError(errorMessage, 400);
        }

        // 5. Fetch rooms with rates
        const roomsWithRates = await this.roomRepository.getRoomsWithRates(propertyInfoId, availableRoomTypes, hotelCode, normalizedStartDate, normalizedEndDate);
        if (!roomsWithRates.length) {
            throw new AppError(`No room rates found for selected range: ${startDate} to ${endDate}`, 400);
        }

        // 6. Generate coupon & QR
        const couponCode = await generateCouponCode();
        const getPropertyDetails = await propertyDetailsService.getRoomsByPropertyIdService(propertyInfoId);
        console.log(`The data we get from SERVICE ${getPropertyDetails}`);
        const deepLinkUrl = `${process.env.DEEP_LINK}/property/${propertyInfoId}
            ?coupon=${couponCode.code}
            &startDate=${startDate}
            &endDate=${endDate}
            &hotelCode=${hotelCode}
            &guestDetails=${guestDetails}
            &hotelDetails=${getPropertyDetails}`;

        const qrCodeData = await QRCode.toDataURL(deepLinkUrl);

        return {
            roomsWithRates,
            couponCode: couponCode.code,
            deepLink: deepLinkUrl,
            qrCode: qrCodeData,
            unavailableRoomTypes
        };
    }
}
