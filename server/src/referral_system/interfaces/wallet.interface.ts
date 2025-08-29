import { ClientSession } from "mongoose";
import { IWallet } from "../models";
import { Request, Response } from "express";

export interface IWalletRepository {
    /**
     * Creates and saves a new wallet document to the database.
     * 
     * @param wallet - Partial wallet data containing customerId, totalEarned, totalRedeemed, currentBalance, and currency
     * @returns The newly created wallet document
     */
    createWallet(wallet: Partial<IWallet>, session: ClientSession): Promise<IWallet>;

    /**
     * Updates the wallet balance for a specific user.
     * 
     * @param userId - The ID of the user whose wallet is being updated
     * @param amount - The amount to update the balance by (can be positive or negative)
     * @returns The updated wallet document or null if not found
     */
    updateBalance(wallet: Partial<IWallet>): Promise<IWallet | null>;

    /**
     * Retrieves a user's wallet by their ID.
     * 
     * @param userId - The ID of the user to fetch the wallet for
     * @returns The wallet document for the user or null if not found
     */
    getWalletByUserId(userId: string): Promise<IWallet | null>;
}


export interface IWalletService {
    /**
     * Initializes a wallet for a given user.
     * 
     * @param userId - The ID of the user
     * @returns The created wallet document
     */
    initializeWallet(userId: string, session?: ClientSession): Promise<IWallet>;


    /**
     * Add balance to wallet
     * 
     * @param userId - The ID of the user
     * @param amount - The amount to add to the wallet
     */
    addBalanceToWallet(userId: string, amount: number): Promise<IWallet | null>;


    /**
     * Redeems a specified amount from the user's wallet.
     * 
     * @param userId - The ID of the user
     * @param amount - The amount to redeem from the wallet
     * @returns The updated wallet document or null if not found
     */
    redeemBalanceFromWallet(userId: string, amount: number): Promise<IWallet | null>;


    /**
     * Modifies the wallet balance for a user.
     * 
     * @param userId - The ID of the user
     * @param amount - The amount to add or subtract
     * @returns The updated wallet document or null
     */
    modifyWalletBalance(userId: string, amount: number): Promise<IWallet | null>;

    /**
     * Fetches the wallet of a user.
     * 
     * @param userId - The ID of the user
     * @returns The user's wallet or null
     */
    fetchWalletByUser(userId: string): Promise<IWallet | null>;
}


export interface IWalletController {
    /**
     * Handles wallet creation for a user.
     * 
     * @param req - Express request object
     * @param res - Express response object
     * @returns The created wallet document
     */
    handleWalletCreation(req: Request, res: Response): Promise<Response<IWallet>>;

    /**
     * Handles wallet balance update for a user.
     * 
     * @param req - Express request object
     * @param res - Express response object
     * @returns The updated wallet or null
     */
    handleBalanceIncrement(req: Request, res: Response): Promise<Response<IWallet> | null>;

    /**
     * Handles redeeming a user's wallet balance.
     * 
     * @param req - Express request object
     * @param res - Express response object
     */
    handleRedeemption(req: Request, res: Response): Promise<Response<IWallet> | null>;

    /**
     * Handles fetching a user's wallet.
     * 
     * @param req - Express request object
     * @param res - Express response object
     * @returns The wallet document or null
     */
    handleFetchWallet(req: Request, res: Response): Promise<Response<IWallet> | null>;
}
