import { Router } from "express";
import { checkout, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.route("/checkout").post(checkout as any);
router.route("/verify").post(verifyPayment as any);

export default router;
