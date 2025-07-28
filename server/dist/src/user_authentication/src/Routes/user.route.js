"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../Middleware/auth.middleware");
const userAuthentication_controller_1 = require("../Controller/userAuthentication.controller");
const authentication_controller_1 = require("../Controller/authentication.controller");
const router = (0, express_1.Router)();
const userController = new userAuthentication_controller_1.UserController();
const authController = new authentication_controller_1.AuthController();
// Type assertions to help TypeScript understand our middleware chain
router
    .route("/")
    .get(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("groupManager", "superAdmin"), userController.getAllUsers);
router
    .route("/me")
    .get(auth_middleware_1.protect, userController.getMe);
// Add route to get user by ID
router
    .route("/:id")
    .get(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("superAdmin", "groupManager"), userController.getUserById);
router
    .route("/update")
    .put(auth_middleware_1.protect, userController.updateProfile);
// Add route to update user by ID
router
    .route("/update/:id")
    .put(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("superAdmin", "groupManager"), userController.updateUserById);
// Delete user endpoint with role-based restrictions
router
    .route("/delete/:id")
    .delete(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("superAdmin", "groupManager"), userController.deleteUser);
// // Create user endpoint with role-based restrictions
// router
//   .route("/create-user")
//   .post(
//     protect as RequestHandler,
//     restrictTo("superAdmin", "groupManager") as RequestHandler,
//     authController.createUser as RequestHandler
//   );
// Role-specific test endpoints with route handler cast to RequestHandler
router.route("/superadmin-only").get(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("superAdmin"), ((req, res) => {
    res.status(200).json({
        status: "success",
        message: "You have superAdmin access",
        data: { user: req.user, role: req.role },
    });
}));
router.route("/manager-only").get(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("superAdmin", "groupManager"), ((req, res) => {
    res.status(200).json({
        status: "success",
        message: "You have management access",
        data: { user: req.user, role: req.role },
    });
}));
exports.default = router;
//# sourceMappingURL=user.route.js.map