"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const authSchema = new mongoose_1.default.Schema({
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
        required: true,
        enum: ["superAdmin", "groupManager", "hotelManager"],
        default: "superAdmin",
    },
    createdBy: {
        type: String,
        required: false, // Optional for superAdmin
    },
}, {
    timestamps: true,
});
authSchema.query.byEmail = function byEmail(email) {
    return this.find({ email });
};
const UserModel = mongoose_1.default.model("UserModel", authSchema);
exports.default = UserModel;
//# sourceMappingURL=auth.model.js.map