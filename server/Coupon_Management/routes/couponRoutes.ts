import express from 'express';
import { generateCouponCode, validateCouponCode } from '../controller/couponController';
import { authenticateCustomer } from "../../Customer-Authentication/src/middleware/authMiddleware";

const router = express.Router();

router.route('/generate').post(generateCouponCode as any);
router.route('/validate').post(authenticateCustomer as any, validateCouponCode as any);

export default router;