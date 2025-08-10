import { Router } from "express";
import { rewardController } from "../container";

const router = Router();

/**
 * @POST /reward/generate
 * Generates a reward for the user.
 * @body { user: { _id: string } }
 */
router.post("/generate", rewardController.generateReward.bind(rewardController));


/**
 * @GET /reward/user/:userId
 * Retrieves all rewards for a specific user.
 */
router.get("/user/:userId", rewardController.getRewardsByUser.bind(rewardController));

export { router as RewardRoutes };