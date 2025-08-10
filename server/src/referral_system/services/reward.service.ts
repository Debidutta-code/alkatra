import { IReward } from "../models";
import { IRewardRepository, IRewardService } from "../interfaces";
import { toObjectId } from "../utils";
import { ValidateService } from "./validate.service";
import { config } from "../../config";

export class RewardService implements IRewardService {
    private rewardRepository: IRewardRepository;

    constructor(rewardRepository: IRewardRepository) {
        this.rewardRepository = rewardRepository;
    }


    /**
     * Generates a reward for a user based on the referral ID and type.
     * @param userId - The ID of the user receiving the reward.
     * @param referralId - The ID of the referral associated with the reward.
     * @param type - The type of reward (discount, cash, or points).
     * @returns The created reward document.
     */
    async generateReward(
        userId: string,
        referralId: string,
        type: "discount" | "cash" | "points"
    ): Promise<IReward> {
        // Validate userId
        ValidateService.validateUserId(userId);

        const amount = config.referralSystem.referRewardAmount;
        // Validate amount
        if (!amount || typeof amount !== 'number') throw new Error("Invalid reward amount");

        // Validate reward type
        if (type !== "discount" && type !== "cash" && type !== "points") throw new Error("Reward type must be 'discount', 'cash', or 'points'");

        /**
         * Check if reward document already exists for the user
         * If exists then increment the amount 
         * Else create reward entry
         */
        

        const reward = {
            customerId: toObjectId(userId),
            referralId: toObjectId(referralId),
            rewardType: type,
            amount,
            issuedAt: new Date(),
        };
        return await this.rewardRepository.createReward(reward);
    }


    /**
     * Retrieves all rewards for a specific user
     * @param userId - The ID of the user
     * @returns List of rewards for the user
     */
    async getRewardsByUser(userId: string): Promise<IReward[] | null> {
        return await this.rewardRepository.findByUserId(userId);
    }
}