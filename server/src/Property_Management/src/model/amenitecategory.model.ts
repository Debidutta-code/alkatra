// import mongoose, { Document, Schema, Types } from "mongoose";

// interface AmeniteCategoryType extends Document {
//   category: String;
//   categoryCode: String;
//   amenities: Types.ObjectId[];
// }

// const ameniteCategorySchema = new Schema<AmeniteCategoryType>(
//   {
//     category: { type: String, required: true },
//     categoryCode: { type: String, required: true },
//     amenities: [
//       {
//         type: Types.ObjectId,
//         ref: "Amenities",
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// const AmeniteCategory = mongoose.model<AmeniteCategoryType>(
//   "AmeniteCategory",
//   ameniteCategorySchema
// );

// export default AmeniteCategory;
