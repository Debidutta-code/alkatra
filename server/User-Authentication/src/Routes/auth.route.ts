import { Router } from "express";
import { AuthController } from "../Controller/authentication.controller";
import { protect, restrictTo } from "../Middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// Public routes - no authentication required
router.route("/login").post(authController.login as any);
router.route("/verify/email").post(authController.verifyEmail as any);

// Protected routes - require authentication
router.route("/register").post(authController.register as any);
// .post(restrictTo("superAdmin"), authController.register as any);
router.route("/logout").post(protect as any, authController.logout as any);
router
  .route("/update/password")
  .patch(protect as any, authController.updatePassword as any);

export default router;
