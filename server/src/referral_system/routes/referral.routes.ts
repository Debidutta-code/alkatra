import { Router } from "express";
import { referralController } from "../container"; 
import { authenticateCustomer } from "../../customer_authentication/src/middleware/authMiddleware";

const router = Router();

/**
 * @POST /referral/generate-code
 * Generates a referral code for the user.
 * @body { user: { _id: string } }
 */
router.post("/generate", authenticateCustomer, referralController.generateReferral.bind(referralController));


/**
 * @POST /referral/apply-code
 * Applies a referral code to a user.
 * @body { referrerId: string, refereeId: string, referralCode: string }
 */
router.post("/apply", referralController.applyReferralCode.bind(referralController));


/**
 * @GET /referral/:referrerId
 * Retrieves all referrals made by a specific referrer.
 * @param { referrerId: string }
 */
router.get("/", authenticateCustomer, referralController.getReferralsByReferrer.bind(referralController));

export { router as ReferralRoutes };
