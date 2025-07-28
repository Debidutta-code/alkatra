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
exports.AuthController = void 0;
const catchAsync_1 = require("../Utils/catchAsync");
const userAuthentication_service_1 = require("../Service/userAuthentication.service");
class AuthController {
    constructor() {
        this.register = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Set role to superAdmin by default for /register endpoint
            const userData = Object.assign(Object.assign({}, req.body), { role: req.body.role || "superAdmin" });
            const newUser = yield this.userService.registerUser(userData);
            // Create a user object without the password
            const userResponse = {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                contact: newUser.contact,
                createdBy: newUser.createdBy,
            };
            res.status(201).json({
                status: "success",
                error: "false",
                message: "User registered successfully",
                data: userResponse,
            });
        }));
        this.login = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const { user, accessToken } = yield this.userService.loginUser({
                email,
                password,
            });
            // Create a user object without sensitive data
            const userData = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                contact: user.contact,
            };
            res
                .status(200)
                .cookie("accessToken", accessToken, { httpOnly: false, secure: true })
                .json({
                status: "success",
                error: false,
                message: "User logged in successfully",
                data: {
                    accessToken,
                    user: userData,
                },
            });
        }));
        this.logout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("accessToken");
            res.status(200).json({
                status: "success",
                message: "User logged out successfully",
            });
        }));
        this.verifyEmail = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            yield this.userService.verifyEmail(email);
            res.status(200).json({
                status: "success",
                message: "Email verified, proceed to reset password",
            });
        }));
        this.updatePassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this.userService.updateUserPassword(req.body);
            res.status(200).json({
                status: "success",
                message: "Password updated successfully",
            });
        }));
        this.createUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Get the creator's email from the JWT token
            const creatorEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
            // Check if creator role is allowed to create the requested role
            const creatorRole = req.role;
            const requestedRole = req.body.role;
            // Validate role creation permissions
            if (creatorRole === "groupManager" && requestedRole === "groupManager") {
                return res.status(403).json({
                    status: "error",
                    message: "Group managers cannot create other group managers",
                });
            }
            // Only allow creating users with hotelManager or groupManager roles
            const userData = Object.assign(Object.assign({}, req.body), { role: req.body.role &&
                    ["hotelManager", "groupManager"].includes(req.body.role)
                    ? req.body.role
                    : "hotelManager", createdBy: creatorEmail });
            const newUser = yield this.userService.registerUser(userData);
            // Create a user object without the password
            const userResponse = {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                contact: newUser.contact,
                createdBy: newUser.createdBy,
            };
            // When PropertyInfo is created elsewhere in the system, it should receive only the user ID
            // This ensures proper ObjectId casting when saving to the PropertyInfo model
            res.status(201).json({
                status: "success",
                error: false,
                message: "User created successfully",
                data: userResponse,
            });
        }));
        this.userService = new userAuthentication_service_1.UserService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authentication.controller.js.map