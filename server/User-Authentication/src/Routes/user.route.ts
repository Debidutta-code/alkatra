import { Router } from "express";
import { protect, restrictTo } from "../Middleware/auth.middleware";
import { UserController } from '../Controller/userAuthentication.controller';

const router = Router();
const userController = new UserController();

router.route("/").get(protect as any, restrictTo('admin', 'superadmin'), userController.getAllUsers as any);
router.route("/me").get(protect as any, userController.getMe as any);
router.route("/update").patch(protect as any ,userController.updateProfile as any)


export default router;
