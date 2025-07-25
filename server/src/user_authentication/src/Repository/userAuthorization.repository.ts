import mongoose from "mongoose";
import UserModel, { AuthType } from "../Model/auth.model";
import { ErrorMessages, formatError } from "../Error/errorMessages";

interface PaginatedUsers {
  users: AuthType[];
  total: number;
  totalPages: number;
}

export class UserRepository {
  [x: string]: any;

  async findUserById(userId: string): Promise<AuthType | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw formatError(ErrorMessages.INVALID_ID);
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw formatError(ErrorMessages.USER_NOT_FOUND);
    }
    return user;
  }

  async updateUser(
    userId: string,
    updates: Partial<AuthType>
  ): Promise<AuthType | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw formatError(ErrorMessages.INVALID_ID);
    }
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    if (!updatedUser) {
      throw formatError(ErrorMessages.USER_NOT_FOUND);
    }
    return updatedUser;
  }
  async getAllUsers(
    page: number,
    limit: number,
    userRole: "superAdmin" | "groupManager" | "hotelManager"
  ): Promise<PaginatedUsers> {
    if (userRole !== "superAdmin" && userRole !== "groupManager") {
      throw formatError(ErrorMessages.UNAUTHORIZED_ACTION);
    }
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw formatError(ErrorMessages.INVALID_QUERY_PARAM);
    }
    const skip = (page - 1) * limit;

    // Define query based on user role
    let query = {};
    if (userRole === "superAdmin") {
      // superAdmin can see both hotelManager and groupManager users
      query = { role: { $in: ["hotelManager", "groupManager"] } };
    } else if (userRole === "groupManager") {
      // groupManager can only see hotelManager users
      query = { role: "hotelManager" };
    }

    const users = await UserModel.find(query).skip(skip).limit(limit);
    const total = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    return { users, total, totalPages };
  }

  async findUserByEmail(email: string): Promise<AuthType | null> {
    const user = await UserModel.findOne({ email }).select("+password");
    return user;
  }

  async findUserByRole(
    role: "superAdmin" | "groupManager" | "hotelManager"
  ): Promise<AuthType | null> {
    const user = await UserModel.findOne({ role });
    return user;
  }

  async findUserByEmailWithPassword(email: string): Promise<AuthType | null> {
    const user = await UserModel.findOne({ email }).select("password email firstName lastName role");
    return user;
  }

  async createUser(userData: Partial<AuthType>): Promise<AuthType> {
    const user = await UserModel.create(userData);
    console.log("User in auth",user)
    return user;
  }

  async updateUserPassword(
    email: string,
    hashedPassword: string
  ): Promise<AuthType | null> {
    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true, runValidators: false }
    );
    if (!updatedUser) {
      throw formatError(ErrorMessages.EMAIL_NOT_FOUND);
    }
    return updatedUser;
  }

  async getAllUsersCreatedBy(
    page: number,
    limit: number,
    creatorEmail: string
  ): Promise<PaginatedUsers> {
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw formatError(ErrorMessages.INVALID_QUERY_PARAM);
    }
    const skip = (page - 1) * limit;

    // Find users created by the specified email
    const users = await UserModel.find({ createdBy: creatorEmail })
      .skip(skip)
      .limit(limit);

    const total = await UserModel.countDocuments({ createdBy: creatorEmail });
    const totalPages = Math.ceil(total / limit);

    return { users, total, totalPages };
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw formatError(ErrorMessages.INVALID_ID);
    }

    const result = await UserModel.findByIdAndDelete(userId);

    if (!result) {
      throw formatError(ErrorMessages.USER_NOT_FOUND);
    }

    return true;
  }
}
