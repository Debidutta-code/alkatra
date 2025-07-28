"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_controller_1 = require("../Controller/authentication.controller");
const auth_middleware_1 = require("../Middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new authentication_controller_1.AuthController();
// Public routes - no authentication required
router.route("/login").post(authController.login);
router
    .route("/verify/email")
    .post(authController.verifyEmail);
// Protected routes - require authentication
router.route("/register").post(authController.register);
// Admin route for creating users with specific roles
router
    .route("/create-user")
    .post(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("superAdmin", "groupManager"), authController.createUser);
router.route("/logout").post(authController.logout);
router
    .route("/update/password")
    .patch(authController.updatePassword);
exports.default = router;
//# sourceMappingURL=auth.route.js.map