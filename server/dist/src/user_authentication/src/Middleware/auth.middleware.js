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
exports.restrictTo = exports.protect = void 0;
const catchAsync_1 = require("../Utils/catchAsync");
const jwtHelper_1 = require("../Utils/jwtHelper");
const errorMessages_1 = require("../Error/errorMessages");
exports.protect = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.NO_TOKEN_PROVIDED);
    }
    try {
        const decoded = yield (0, jwtHelper_1.decodeToken)(token, process.env.JWT_SECRET_KEY_DEV);
        // console.log("decoded",decoded)
        if (!decoded || !decoded.id || !decoded.role || !decoded.email) {
            throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.INVALID_TOKEN);
        }
        req.jwt = token;
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        req.role = decoded.role;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.EXPIRED_TOKEN);
        }
        throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.INVALID_TOKEN);
    }
}));
const restrictTo = (...roles) => (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
        throw (0, errorMessages_1.formatError)(errorMessages_1.ErrorMessages.UNAUTHORIZED_ACTION);
    }
    next();
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=auth.middleware.js.map