import { Router } from "express";
import { 
  createPaymentIntent,
  createSetupIntent
} from "../controllers/payment.controller";
import {
  createReservationWithStoredCard
} from "../controllers/bookings.controller";
import { protect } from "../../../User-Authentication/src/Middleware/auth.middleware"

const router = Router();

// Payment intent routes
router.route("/create-payment-intent").post(createPaymentIntent);
router.route("/create-setup-intent").post(createSetupIntent);
router.route("/create-reservation-with-card").post(protect as any, createReservationWithStoredCard);

export default router;