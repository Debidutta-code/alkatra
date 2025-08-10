import { Router } from "express";
import { ReferralRoutes } from "./referral.routes";
import { RewardRoutes } from "./reward.routes";
import { WalletRoutes } from "./wallet.routes";

const router = Router();

router.use("/rewards", RewardRoutes);
router.use("/wallet", WalletRoutes);
router.use("/", ReferralRoutes);

export { router as ReferralRouter };