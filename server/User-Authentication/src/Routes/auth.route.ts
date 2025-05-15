import { Router } from "express";
import { AuthController } from "../Controller/authentication.controller";

const router = Router();
const authController = new AuthController();

router.route("/register").post(authController.register as any);
router.route("/login").post(authController.login as any);
router.route("/logout").post(authController.logout as any);
router.route("/verify/email").post(authController.verifyEmail as any);
router.route("/update/password").patch(authController.updatePassword as any);

export default router;
