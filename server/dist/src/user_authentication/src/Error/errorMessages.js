"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = exports.ErrorMessages = void 0;
exports.ErrorMessages = {
    INVALID_ID: {
        status: 400,
        code: 4001,
        title: "INVALID FORMAT",
        detail: "Invalid user ID format",
        source: { parameter: "id" },
    },
    USER_NOT_FOUND: {
        status: 404,
        code: 4041,
        title: "NOT FOUND",
        detail: "No user found with the provided ID",
        source: { parameter: "id" },
    },
    UNAUTHORIZED_ACTION: {
        status: 403,
        code: 4031,
        title: "FORBIDDEN",
        detail: "You are not authorized to perform this action",
    },
    ROLE_UPDATE_NOT_ALLOWED: {
        status: 403,
        code: 4032,
        title: "FORBIDDEN",
        detail: "You cannot update the user role",
    },
    SUPERADMIN_ROLE_ONLY: {
        status: 403,
        code: 4033,
        title: "FORBIDDEN",
        detail: "Only superadmin can update the user role",
    },
    PROFILE_UPDATE_FAILED: {
        status: 500,
        code: 5001,
        title: "SERVER ERROR",
        detail: "Failed to update user profile",
    },
    INVALID_QUERY_PARAM: {
        status: 400,
        code: 4002,
        title: "INVALID FORMAT",
        detail: "Invalid query parameter format",
        source: { parameter: "page | limit" },
    },
    NO_TOKEN_PROVIDED: {
        status: 401,
        code: 4011,
        title: "UNAUTHORIZED",
        detail: "No token provided, please log in to continue",
        source: { parameter: "authorization" },
    },
    INVALID_TOKEN: {
        status: 401,
        code: 4012,
        title: "UNAUTHORIZED",
        detail: "Invalid or malformed token",
        source: { parameter: "authorization" },
    },
    EXPIRED_TOKEN: {
        status: 401,
        code: 4013,
        title: "UNAUTHORIZED",
        detail: "Token has expired, please log in again",
        source: { parameter: "authorization" },
    },
    MISSING_REGISTRATION_FIELDS: {
        status: 400,
        code: 4003,
        title: "INVALID INPUT",
        detail: "Please fill all the required fields",
        source: { parameter: "firstName | lastName | email | password" },
    },
    USER_ALREADY_EXISTS: {
        status: 400,
        code: 4004,
        title: "CONFLICT",
        detail: "User already exists with this email",
        source: { parameter: "email" },
    },
    USER_ROLE_ALREADY_EXISTS: {
        status: 400,
        code: 4005,
        title: "CONFLICT",
        detail: "A user with this role already exists",
        source: { parameter: "role" },
    },
    MISSING_LOGIN_CREDENTIALS: {
        status: 400,
        code: 4005,
        title: "INVALID INPUT",
        detail: "Please provide email and password",
        source: { parameter: "email | password" },
    },
    INVALID_LOGIN_CREDENTIALS: {
        status: 401,
        code: 4014,
        title: "UNAUTHORIZED",
        detail: "Invalid email or password",
        source: { parameter: "email | password" },
    },
    MISSING_EMAIL: {
        status: 400,
        code: 4006,
        title: "INVALID INPUT",
        detail: "Please provide a valid email",
        source: { parameter: "email" },
    },
    EMAIL_NOT_FOUND: {
        status: 404,
        code: 4042,
        title: "NOT FOUND",
        detail: "User with this email does not exist",
        source: { parameter: "email" },
    },
    MISSING_PASSWORD_UPDATE_FIELDS: {
        status: 400,
        code: 4007,
        title: "INVALID INPUT",
        detail: "Email and new password are required",
        source: { parameter: "email | newPassword" },
    },
};
const formatError = (error) => ({
    errors: [error],
});
exports.formatError = formatError;
//# sourceMappingURL=errorMessages.js.map