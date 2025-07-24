import mongoose, { Schema, model, Document, Model } from "mongoose";

interface IRoomType extends Document {
    roomTypeCode: string;  // Made non-optional since it's required in schema
    description: string;
}

const RoomTypesSchema = new Schema<IRoomType>({
    roomTypeCode: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

// Create the model with proper typing
const RoomType: Model<IRoomType> = mongoose.models.RoomType || 
                                  model<IRoomType>("RoomType", RoomTypesSchema);

export default RoomType;