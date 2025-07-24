import mongoose, { Model, Schema, Types } from "mongoose";

export type AmeniteAttributeType = {
  amenity: Types.ObjectId;
  attributeName: string;
};

type AmeniteAttributeModelType = Model<AmeniteAttributeType>;

const ameniteAttributeSchema = new Schema<AmeniteAttributeType>({
  amenity: {
    type: Schema.Types.ObjectId,
    ref: "Amenity",
  },
  attributeName: {
    type: String,
    required: true,
  },
});

const AmeniteAttribute = mongoose.model<
  AmeniteAttributeType,
  AmeniteAttributeModelType
>("AmeniteAttribute", ameniteAttributeSchema);

export default AmeniteAttribute;
