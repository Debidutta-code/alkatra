import { Router } from "express";
import { 
  createPaymentIntent,
  createSetupIntent
} from "../controllers/payment.controller";

const router = Router();

// Payment intent routes
router.route("/create-payment-intent").post(createPaymentIntent);
router.route("/create-setup-intent").post(createSetupIntent);

export default router;