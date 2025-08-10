import { IRewardRepository } from "../interfaces";
import { RewardModel, IReward } from "../models";
import { toObjectId } from "../utils";

export class RewardRepository implements IRewardRepository {
    /**
     * Creates and saves a new reward document to the database.
     * 
     * @param reward - Partial reward data containing customerId, referralId, rewardType, and amount
     * @returns The newly created reward document
     */
    async createReward(reward: Partial<IReward>): Promise<IReward> {
        const newReward = new RewardModel(reward);
        return await newReward.save();
    }

    /**
     * Finds a reward record by user ID.
     * 
     * @param userId - The ID of the user (string format)
     * @returns The matched reward document or null if not found
     */
    async findByUserId(userId: string): Promise<IReward[] | null> {
        return await RewardModel.findOne({ customerId: toObjectId(userId) });
    }
}