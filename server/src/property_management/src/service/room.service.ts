import QRCode from "qrcode";
import { RoomRepository } from "../repository";
import { AppError } from "../utils/appError";
import { generateCouponCode } from "../../../coupon_management/services/couponService";
import { PropertyDetails } from "./get.property.details.service";
import { ObjectId } from "mongoose";

const roomRepository = new RoomRepository();
const propertyDetailsService = new PropertyDetails();


export class RoomService {

    private roomRepository = new RoomRepository();

    async storeDeepLinkData(couponCode: string, startDate: string, endDate: string, hotelCode: string, guestDetails, getPropertyDetails) {

        if (!couponCode || !startDate || !endDate || !hotelCode || !guestDetails || !getPropertyDetails) {
            throw new Error("Required details are not found for storing in Deep link model");
        }
        return await roomRepository.storeDeepLinkData(couponCode, startDate, endDate, hotelCode, guestDetails, getPropertyDetails);
    }

    async getDeepLinkData(deepLinkId: string) {
        console.log(`The getting deep link data in service ${deepLinkId}`);
        if (!deepLinkId) {
            throw new Error("Deep link id not found in service");
        }
        return await roomRepository.getDeepLinkData(deepLinkId);
    }


    async getRoomsByPropertyId(params: {
        propertyInfoId: string;
        numberOfRooms: number;
        startDate: string;
        endDate: string;
        hotelCode: string;
        guestDetails: string;
    }) {
        const { propertyInfoId, numberOfRooms, startDate, endDate, hotelCode, guestDetails } = params;

        const { propertyDetails, rooms, roomTypes, normalizedStartDate, normalizedEndDate } = await this.validateAndFetchInitialData(params);

        const { availableRoomTypes, unavailableRoomTypes } = await this.checkRoomAvailability(
            hotelCode,
            roomTypes,
            normalizedStartDate,
            normalizedEndDate,
            numberOfRooms
        );

        const { roomsWithRates, couponCode, deepLink, qrCode } = await this.fetchRatesAndGenerateData({
            propertyInfoId,
            availableRoomTypes,
            hotelCode,
            normalizedStartDate,
            normalizedEndDate,
            startDate,
            endDate,
            guestDetails,
            propertyDetails
        });

        return {
            roomsWithRates,
            couponCode,
            deepLink,
            qrCode,
            unavailableRoomTypes
        };
    }

    private async validateAndFetchInitialData(params: {
        propertyInfoId: string;
        startDate: string;
        endDate: string;
        hotelCode: string;
    }) {
        const { propertyInfoId, startDate, endDate, hotelCode } = params;

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

        const [propertyDetails, rooms] = await Promise.all([
            this.roomRepository.getPropertyById(propertyInfoId),
            this.roomRepository.getRoomsByPropertyId(propertyInfoId)
        ]);

        if (!propertyDetails || propertyDetails.property_code !== hotelCode) {
            throw new AppError(`Property not found or property code mismatch`, 404);
        }
        if (!rooms.length) {
            throw new AppError("No room found with given property ID", 404);
        }

        return {
            propertyDetails,
            rooms,
            roomTypes: rooms.map(r => r.room_type),
            normalizedStartDate,
            normalizedEndDate
        };
    }

    // private async checkRoomAvailability(
    //     hotelCode: string,
    //     roomTypes: string[],
    //     startDate: Date,
    //     endDate: Date,
    //     numberOfRooms: number
    // ) {
    //     const availabilityData = await this.roomRepository.checkRoomsAvailability(hotelCode, roomTypes, startDate, endDate, numberOfRooms);
    //     const availabilityMap = new Map<string, Set<string>>();

    //     console.log("The room availability data", availabilityData);

    //     const unavailableMap = new Map<string, string[]>();

    //     availabilityData.forEach(item => {
    //         const dateStr = item.availability?.startDate?.toISOString().split("T")[0] || null;

    //         if (!unavailableMap.has(item.invTypeCode)) {
    //             unavailableMap.set(item.invTypeCode, []);
    //         }

    //         unavailableMap.get(item.invTypeCode)!.push(dateStr);
    //     });


    //     const dateList: string[] = [];
    //     let current = new Date(startDate);
    //     while (current <= endDate) {
    //         dateList.push(current.toISOString().split("T")[0]);
    //         current.setDate(current.getDate() + 1);
    //     }

    //     // const totalDays = dateList.length;

    //     const unavailableRoomTypes: { roomType: string; dates: string[] }[] = [];
    //     const availableRoomTypes: string[] = [];

    //     for (const roomType of roomTypes) {
    //         const availableDates = availabilityMap.get(roomType) || new Set();
    //         const missingDates = dateList.filter(date => !availableDates.has(date));

    //         if (missingDates.length === 0) {
    //             availableRoomTypes.push(roomType);
    //         } else {
    //             unavailableRoomTypes.push({ roomType, dates: missingDates });
    //         }
    //     }

    //     if (!availableRoomTypes.length) {
    //         const errorMessage = unavailableRoomTypes
    //             .map(({ roomType, dates }) => `Room type ${roomType} is unavailable on ${dates.join(", ")} for ${numberOfRooms} rooms`)
    //             .join("; ");
    //         throw new AppError(errorMessage, 400);
    //     }

    //     return { availableRoomTypes, unavailableRoomTypes };
    // }

    private async checkRoomAvailability(
        hotelCode: string,
        roomTypes: string[],
        startDate: Date,
        endDate: Date,
        numberOfRooms: number
    ) {
        const availabilityData = await this.roomRepository.checkRoomsAvailability(
            hotelCode, roomTypes, startDate, endDate, numberOfRooms
        );

        // ✅ Build required date list in YYYY-MM-DD format
        const requiredDates: string[] = [];
        let current = new Date(startDate);
        while (current < endDate) {
            requiredDates.push(current.toISOString().split("T")[0]);
            current.setDate(current.getDate() + 1);
        }

        // ✅ Build availability map: roomType => Set of available dates
        const availabilityMap = new Map<string, Set<string>>();

        for (const item of availabilityData) {
            const roomType = item.invTypeCode;
            const dateStr = item.availability?.startDate?.toISOString().split("T")[0];

            if (!dateStr) continue; // skip if date is missing

            if (!availabilityMap.has(roomType)) {
                availabilityMap.set(roomType, new Set());
            }

            availabilityMap.get(roomType)!.add(dateStr);
        }

        // ✅ Compare requiredDates with availableDates for each room type
        const unavailableRoomTypes: { roomType: string; dates: string[] }[] = [];
        const availableRoomTypes: string[] = [];

        for (const roomType of roomTypes) {
            const availableDates = availabilityMap.get(roomType) || new Set();
            const missingDates = requiredDates.filter(date => !availableDates.has(date));

            if (missingDates.length > 0) {
                // Room is missing on some dates
                unavailableRoomTypes.push({ roomType, dates: missingDates });
            } else {
                // Fully available for all required dates
                availableRoomTypes.push(roomType);
            }
        }

        console.log("Available Room Types:", availableRoomTypes);
        console.log("Unavailable Room Types:", unavailableRoomTypes);

        if (availableRoomTypes.length === 0) {
            const errorMessage = unavailableRoomTypes
                .map(({ roomType, dates }) =>
                    `Room type ${roomType} is unavailable on ${dates.join(", ")} for ${numberOfRooms} rooms`)
                .join("; ");
            throw new AppError(errorMessage, 400);
        }

        return { availableRoomTypes, unavailableRoomTypes };
    }


    private async fetchRatesAndGenerateData(params: {
        propertyInfoId: string;
        availableRoomTypes: string[];
        hotelCode: string;
        normalizedStartDate: Date;
        normalizedEndDate: Date;
        startDate: string;
        endDate: string;
        guestDetails: string;
        propertyDetails: any;
    }) {
        const {
            propertyInfoId,
            availableRoomTypes,
            hotelCode,
            normalizedStartDate,
            normalizedEndDate,
            startDate,
            endDate,
            guestDetails,
            propertyDetails
        } = params;
        const [roomsWithRates, couponCodeResult] = await Promise.all([
            this.roomRepository.getRoomsWithRates(propertyInfoId, availableRoomTypes, hotelCode, normalizedStartDate, normalizedEndDate),
            generateCouponCode()
        ]);
        if (!roomsWithRates.length) {
            throw new AppError(`No room rates found for selected range: ${startDate} to ${endDate}`, 400);
        }
        const storedDeepLinkData = await this.storeDeepLinkData(
            couponCodeResult.code,
            startDate,
            endDate,
            hotelCode,
            guestDetails,
            propertyDetails
        );
        if (!storedDeepLinkData) {
            throw new Error("Data can't store in DB");
        }
        const deepLinkUrl = `${process.env.DEEP_LINK}/property/${propertyInfoId}?deepLinkCode=${storedDeepLinkData}`;
        const qrCodeData = await QRCode.toDataURL(deepLinkUrl);
        return {
            roomsWithRates,
            couponCode: couponCodeResult.code,
            deepLink: deepLinkUrl,
            qrCode: qrCodeData
        };
    }

}
