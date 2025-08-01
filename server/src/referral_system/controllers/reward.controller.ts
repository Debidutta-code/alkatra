import { Request, Response } from "express";
import { IRewardService, IRewardController } from "../interfaces";

export class RewardController implements IRewardController {
    private rewardService: IRewardService;

    constructor(rewardService: IRewardService) {
        this.rewardService = rewardService;
    }


    /**
     * Generates a reward for a user based on the referral ID and type.
     */
    async generateReward(req: Request, res: Response) {
        try {
            const { userId, referralId, type } = req.body;

            const reward = await this.rewardService.generateReward(userId, referralId, type);
            return res.status(201).json(reward);
        } catch (err) {
            return res.status(500).json({ error: "Failed to generate reward" });
        }
    }


    /**
     * Retrieves all rewards for a specific user
     */
    async getRewardsByUser(req: Request, res: Response) {
        const { userId } = req.params;
        try {
            const rewards = await this.rewardService.getRewardsByUser(userId);
            return res.status(200).json(rewards);
        } catch (err) {
            return res.status(500).json({ error: "Unable to fetch rewards" });
        }
    }
}