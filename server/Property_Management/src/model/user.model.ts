import mongoose, { Model } from "mongoose";

export interface UserType {
  userId: string;
  role: string;
}

type UserModelType = Model<UserType>;

const userSchema = new mongoose.Schema<UserType, {}, {}>(
  {
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "user", "property_manager"],
      default: "superadmin",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<UserType, UserModelType>("PropertyUser", userSchema);

export default User;
