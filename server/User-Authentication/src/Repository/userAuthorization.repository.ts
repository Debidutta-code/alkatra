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

    async updateUser(userId: string, updates: Partial<AuthType>): Promise<AuthType | null> {
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

    async getAllUsers(page: number, limit: number, userRole: string): Promise<PaginatedUsers> {
        if (userRole !== "superadmin") {
            throw formatError(ErrorMessages.SUPERADMIN_ROLE_ONLY);
        }
        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
            throw formatError(ErrorMessages.INVALID_QUERY_PARAM);
        }
        const skip = (page - 1) * limit;
        const users = await UserModel.find({ role: "user" })
            .skip(skip)
            .limit(limit);
        const total = await UserModel.countDocuments({ role: "user" });
        const totalPages = Math.ceil(total / limit);
        return { users, total, totalPages };
    }

    async findUserByEmail(email: string): Promise<AuthType | null> {
        const user = await UserModel.findOne({ email });
        return user;
    }

    async findUserByRole(role: string): Promise<AuthType | null> {
        const user = await UserModel.findOne({ role });
        return user;
    }

    async findUserByEmailWithPassword(email: string): Promise<AuthType | null> {
        const user = await UserModel.findOne({ email }).select("+password");
        return user;
    }

    async createUser(userData: Partial<AuthType>): Promise<AuthType> {
        const user = await UserModel.create(userData);
        return user;
    }

    async updateUserPassword(email: string, hashedPassword: string): Promise<AuthType | null> {
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

}