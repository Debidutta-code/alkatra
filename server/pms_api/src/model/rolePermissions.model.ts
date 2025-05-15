import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type RolePermissionType = {
    entityType: "hotel" | "brand" | "group";
    entityId: Types.ObjectId;
    role: string;
    permissions: Types.ObjectId[];
};

type RolePermissionModelType = Model<RolePermissionType>;

const rolePermissionSchema = new Schema<RolePermissionType>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["hotel", "brand", "group"],
    },
    entityId: { type: Schema.Types.ObjectId, required: true, refPath: "entityType" }, 
    role: { type: String, required: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: "ApiEndpoint" }],
  },
  { timestamps: true }
);

const RolePermission = mongoose.model<RolePermissionType, RolePermissionModelType>(
    "RolePermission",
    rolePermissionSchema
);
  
export default RolePermission;