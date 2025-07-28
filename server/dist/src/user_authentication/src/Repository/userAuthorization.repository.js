"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auth_model_1 = __importDefault(require("../Model/auth.model"));
const errorMessages_1 = require("../Error/errorMessages");
class UserRepository {
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.INVALID_ID);
            }
            const user = yield auth_model_1.default.findById(userId);
            if (!user) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.USER_NOT_FOUND);
            }
            return user;
        });
    }
    updateUser(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.INVALID_ID);
            }
            const updatedUser = yield auth_model_1.default.findByIdAndUpdate(userId, updates, {
                new: true,
            });
            if (!updatedUser) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.USER_NOT_FOUND);
            }
            return updatedUser;
        });
    }
    getAllUsers(page, limit, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== "superAdmin" && userRole !== "groupManager") {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.UNAUTHORIZED_ACTION);
            }
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.INVALID_QUERY_PARAM);
            }
            const skip = (page - 1) * limit;
            // Define query based on user role
            let query = {};
            if (userRole === "superAdmin") {
                // superAdmin can see both hotelManager and groupManager users
                query = { role: { $in: ["hotelManager", "groupManager"] } };
            }
            else if (userRole === "groupManager") {
                // groupManager can only see hotelManager users
                query = { role: "hotelManager" };
            }
            const users = yield auth_model_1.default.find(query).skip(skip).limit(limit);
            const total = yield auth_model_1.default.countDocuments(query);
            const totalPages = Math.ceil(total / limit);
            return { users, total, totalPages };
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield auth_model_1.default.findOne({ email }).select("+password");
            return user;
        });
    }
    findUserByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield auth_model_1.default.findOne({ role });
            return user;
        });
    }
    findUserByEmailWithPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield auth_model_1.default.findOne({ email }).select("password email firstName lastName role");
            return user;
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield auth_model_1.default.create(userData);
            console.log("User in auth", user);
            return user;
        });
    }
    updateUserPassword(email, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield auth_model_1.default.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true, runValidators: false });
            if (!updatedUser) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.EMAIL_NOT_FOUND);
            }
            return updatedUser;
        });
    }
    getAllUsersCreatedBy(page, limit, creatorEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.INVALID_QUERY_PARAM);
            }
            const skip = (page - 1) * limit;
            // Find users created by the specified email
            const users = yield auth_model_1.default.find({ createdBy: creatorEmail })
                .skip(skip)
                .limit(limit);
            const total = yield auth_model_1.default.countDocuments({ createdBy: creatorEmail });
            const totalPages = Math.ceil(total / limit);
            return { users, total, totalPages };
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.INVALID_ID);
            }
            const result = yield auth_model_1.default.findByIdAndDelete(userId);
            if (!result) {
                throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.USER_NOT_FOUND);
            }
            return true;
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=userAuthorization.repository.js.map