import { IReward } from "../models";
import { Request, Response } from "express";

export interface IRewardRepository {
    /**
     * Creates and saves a new reward document to the database.
     * 
     * @param reward - Partial reward data containing userId, type, and amount
     * @returns The newly created reward document
     */
    createReward(reward: Partial<IReward>): Promise<IReward>;

    /**
     * Updates the status of a reward using the reward ID.
     * 
     * @param rewardId - The ID of the reward document (string format)
     * @param status - New status value
     * @returns The updated reward document or null if not found
     */
    // updateStatus(rewardId: string, status: string): Promise<IReward | null>;

    /**
     * Finds a reward record by user ID.
     * 
     * @param userId - The ID of the user (string format)
     * @returns The matched reward document or null if not found
     */
    findByUserId(userId: string): Promise<IReward[] | null>;
}

export interface IRewardService {
    /**
     * Generates a reward for a user.
     * 
     * @param userId - The ID of the user to generate the reward for
     * @param type - The type of reward (e.g., "referral_bonus")
     * @param amount - The amount of the reward
     * @returns The created reward document
     */
    generateReward(userId: string, referralId: string, type: string): Promise<IReward>;

    /**
     * Updates the status of a reward.
     * 
     * @param rewardId - The ID of the reward to update
     * @param status - The new status of the reward
     * @returns The updated reward document or null if not found
     */
    // updateRewardStatus(rewardId: string, status: string): Promise<IReward | null>;

    /**
     * Retrieves a user's rewards.
     * 
     * @param userId - The ID of the user to fetch rewards for
     * @returns An array of reward documents for the user
     */
    getRewardsByUser(userId: string): Promise<IReward[] | null>;
}

export interface IRewardController {
    /**
     * Generates a reward for a user and sends it in the response.
     */
    generateReward(req: Request, res: Response): Promise<Response<IReward> | void>;

    /**
     * Updates the status of a reward and sends the updated reward in the response.
     */
    // updateRewardStatus(req: Request, res: Response): Promise<Response<IReward | null> | void>;

    /**
     * Retrieves a user's rewards and sends them in the response.
     */
    getRewardsByUser(req: Request, res: Response): Promise<Response<IReward[]> | void>;
}