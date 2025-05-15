import mongoose, { HydratedDocument, Model, QueryWithHelpers, Schema, Types } from "mongoose";
import { createHash } from "../Utils/bcryptHelper";

export interface AuthType {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  contact: number    
  email: string;
  password: string;
  role: string;
}

interface AuthQueryHelpers {
  byEmail(
    email: string
  ): QueryWithHelpers<
    HydratedDocument<AuthType>[],
    HydratedDocument<AuthType>,
    AuthQueryHelpers
  >;
}

type AuthModelType = Model<AuthType, AuthQueryHelpers>;

const authSchema = new mongoose.Schema<AuthType, {}, {}, AuthQueryHelpers>(
  {  
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

authSchema.query.byEmail = function byEmail(
  this: QueryWithHelpers<any, HydratedDocument<AuthType>, AuthQueryHelpers>,
  email: string
) {
  return this.find({ email });
};

const UserModel = mongoose.model<AuthType, AuthModelType>("UserModel", authSchema);
export default UserModel;
