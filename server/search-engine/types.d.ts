import { Types } from "mongoose";

export type BookingsType = {
    property_id: Types.ObjectId;
    room_id: Types.ObjectId;
    customer_id: Types.ObjectId;
    payment_id: Types.ObjectId;
    booking_dates: string[];
    status: string;
    reviews: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}