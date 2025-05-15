import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomType extends Document {
  code: string;
  name: string;
  description: string;
}

const RoomTypeSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const RoomType = mongoose.model<IRoomType>('RoomType', RoomTypeSchema);

export default RoomType;
