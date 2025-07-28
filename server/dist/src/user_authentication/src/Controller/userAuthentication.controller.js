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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userAuthentication_service_1 = require("../Service/userAuthentication.service");
const catchAsync_1 = require("../Utils/catchAsync");
const property_info_model_1 = require("../../../property_management/src/model/property.info.model");
class UserController {
    constructor() {
        this.getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // console.log("userid",userId)
            try {
                const user = yield this.userService.getUserById(userId);
                const availableProperties = yield property_info_model_1.PropertyInfo.find({ user_id: userId });
                // Create a user object without sensitive data
                const userData = {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    contact: user.contact,
                    createdBy: user.createdBy,
                    noOfProperties: availableProperties.length
                };
                res.status(200).json({
                    status: "success",
                    error: false,
                    message: "User fetched successfully",
                    data: { user: userData },
                });
            }
            catch (error) {
                console.log(error.message);
                const err = error;
                res.status(err.errors[0].status).json(err);
            }
        }));
        this.updateProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const requestingUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const requestingUserRole = req.role;
            const { id, firstName, lastName, email, role } = req.body;
            try {
                const updatedUser = yield this.userService.updateUserProfile(id, requestingUserId || "", requestingUserRole, {
                    firstName,
                    lastName,
                    email,
                    role: role,
                });
                // Create a user object without sensitive data
                const userData = {
                    id: updatedUser._id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    contact: updatedUser.contact,
                    createdBy: updatedUser.createdBy,
                };
                res.status(200).json({
                    status: "success",
                    error: false,
                    message: "User profile updated successfully",
                    data: { user: userData },
                });
            }
            catch (error) {
                const err = error;
                res.status(err.errors[0].status).json(err);
            }
        }));
        this.getAllUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const requestingUserRole = req.role;
            const requestingUserEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
            try {
                const { users, total, totalPages } = yield this.userService.getAllUsers(page, limit, requestingUserRole, requestingUserEmail);
                // Filter out sensitive information from users
                const safeUsers = users.map((user) => ({
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    contact: user.contact,
                    createdBy: user.createdBy,
                }));
                res.status(200).json({
                    status: "success",
                    error: false,
                    message: "Users fetched successfully",
                    pagination: { total, page, totalPages, limit },
                    data: { users: safeUsers },
                });
            }
            catch (error) {
                const err = error;
                res.status(err.errors[0].status).json(err);
            }
        }));
        this.deleteUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            try {
                yield this.userService.deleteUser(userId);
                res.status(200).json({
                    status: "success",
                    error: false,
                    message: "User deleted successfully",
                });
            }
            catch (error) {
                const err = error;
                res.status(err.errors[0].status).json(err);
            }
        }));
        this.getUserById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            try {
                const user = yield this.userService.getUserById(userId);
                // Create a user object without sensitive data
                const userData = {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    contact: user.contact,
                    createdBy: user.createdBy,
                };
                res.status(200).json({
                    status: "success",
                    error: false,
                    message: "User fetched successfully",
                    data: { user: userData },
                });
            }
            catch (error) {
                const err = error;
                res.status(err.errors[0].status).json(err);
            }
        }));
        this.updateUserById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const requestingUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const requestingUserRole = req.role;
            const userId = req.params.id;
            const { firstName, lastName, email, role, password } = req.body;
            try {
                const updatedUser = yield this.userService.updateUserProfile(userId, requestingUserId || "", requestingUserRole, {
                    firstName,
                    lastName,
                    email,
                    role: role,
                    password
                });
                // Create a user object without sensitive data
                const userData = {
                    id: updatedUser._id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    contact: updatedUser.contact,
                    createdBy: updatedUser.createdBy,
                };
                res.status(200).json({
                    status: "success",
                    error: false,
                    message: "User updated successfully",
                    data: { user: userData },
                });
            }
            catch (error) {
                const err = error;
                res.status(err.errors[0].status).json(err);
            }
        }));
        this.userService = new userAuthentication_service_1.UserService();
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userAuthentication.controller.js.map