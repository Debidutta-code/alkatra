
// import mongoose, { Document, Model, Schema, Types } from "mongoose";

// enum AttributeType {
//   DROPDOWN = "dropdown",
//   MULTIPLESELECT = "multiselect",
//   NONE = "none",
// }

// export type AmeniteType = {
//   category: Types.ObjectId;
//   name: String;
//   code: String;
//   isSelected: boolean;
//   template: {
//     attributes: [Types.ObjectId] | null;
//     type: AttributeType;
//   };
// };

// type AmeniteModelType = Model<AmeniteType>;

// const ameniteSchema = new Schema<AmeniteType>(
//   {
//     category: {
//       type: Schema.Types.ObjectId,
//       ref: "AmeniteCategory",
//       required: true,
//     },
//     name: { type: String, required: true },
//     code: { type: String, required: true },
//     isSelected: {
//       type: Boolean,
//       default: false,
//     },
//     template: {
//       attributes: [
//         {
//           type: Types.ObjectId,
//           ref: "AmeniteAttribute",
//         },
//       ],
//       type: {
//         type: String,
//         enum: Object.values(AttributeType),
//         default: AttributeType.NONE,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// ameniteSchema.pre("save", async function (next) {
//   if (!this.template.attributes?.length) {
//     this.template.attributes = null;
//   }

//   next();
// });

// const Amenite = mongoose.model<AmeniteType, AmeniteModelType>(
//   "Amenite",
//   ameniteSchema
// );

// export default Amenite;
