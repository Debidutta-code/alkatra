import { Router, RequestHandler } from "express";
import { AuthController } from "../Controller/authentication.controller";
import { protect, restrictTo } from "../Middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// Public routes - no authentication required
router.route("/login").post(authController.login as RequestHandler);
router
  .route("/verify/email")
  .post(authController.verifyEmail as RequestHandler);

// Protected routes - require authentication
router.route("/register").post(authController.register as RequestHandler);
// Admin route for creating users with specific roles
router
  .route("/create-user")
  .post(
    protect as RequestHandler,
    restrictTo("superAdmin", "groupManager") as RequestHandler,
    authController.createUser as RequestHandler
  );
router.route("/logout").post(authController.logout as RequestHandler);
router
  .route("/update/password")
  .patch(authController.updatePassword as any);

export default router;
