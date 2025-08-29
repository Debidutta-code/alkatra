import { IWallet } from "../models";
import { IWalletRepository, IWalletService } from "../interfaces";
import { GenerateUtils } from "../utils";
import { ValidateService } from "./validate.service";
import { ClientSession } from "mongoose";

export class WalletService implements IWalletService {
    private walletRepository: IWalletRepository;


    constructor(walletRepository: IWalletRepository) {
        this.walletRepository = walletRepository;
    }


    /**
     * Initializes a new wallet for a user.
     * @param userId - The ID of the user
     * @returns The created wallet document
     */
    async initializeWallet(userId: string, session: ClientSession): Promise<IWallet> {
        const walletData: Partial<IWallet> = {
            customerId: GenerateUtils.toObjectId(userId),
            totalEarned: 0,
            totalRedeemed: 0,
            currentBalance: 0,
            currency: "USD"
        };
        return await this.walletRepository.createWallet(walletData, session);
    }


    /**
     * Adds a specified amount to the user's wallet.
     * @param userId - The ID of the user
     * @param amount - The amount to add to the wallet
     * @returns The updated wallet document or null if not found
     */
    async addBalanceToWallet(userId: string, amount: number): Promise<IWallet> {
        const wallet = await this.walletRepository.getWalletByUserId(userId);
        if (!wallet) throw new Error("Wallet not found for the user.");

        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        wallet.totalEarned += amount > 0 ? amount : 0;
        wallet.currentBalance = wallet.totalEarned > 0 ? wallet.totalEarned - wallet.totalRedeemed : amount;

        return await this.walletRepository.updateBalance(wallet);
    }


    /**
     * Subtracts a specified amount from the user's wallet.
     * @param userId - The ID of the user
     * @param amount - The amount to subtract from the wallet
     * @returns The updated wallet document or null if not found
     */
    async redeemBalanceFromWallet(userId: string, amount: number): Promise<IWallet> {
        try {
            // Step 1: Validate the user ID
            const isValid = ValidateService.validateUserId(userId);
            if (!isValid) throw new Error("Invalid user ID");

            // Step 2: Validate the amount
            if (amount <= 0) {
                throw new Error("Amount must be greater than zero.");
            }

            // Step 3: Fetch the wallet for the user
            const wallet = await this.walletRepository.getWalletByUserId(userId);
            if (!wallet) throw new Error("Wallet not found for the user.");

            if (amount > wallet.currentBalance) {
                throw new Error("Amount should not be greater than current balance.");
            }

            // Step 4: Update the wallet balance
            wallet.totalRedeemed += amount;
            wallet.currentBalance -= amount;

            // Step 5: Save the updated wallet
            return await this.walletRepository.updateBalance(wallet);
        } catch (error: any) {
            throw error;
        }
    }


    /**
     * Modifies the wallet balance for a user.
     * @param userId - The ID of the user
     * @param amount - The amount to add or subtract
     * @returns The updated wallet document or null
     */
    async modifyWalletBalance(userId: string, amount: number): Promise<IWallet | null> {
        const wallet = await this.walletRepository.getWalletByUserId(userId);
        if (!wallet) throw new Error("Wallet not found for the user.");

        wallet.totalEarned += amount > 0 ? amount : 0;
        wallet.totalRedeemed += amount < 0 ? Math.abs(amount) : 0;
        wallet.currentBalance += amount;

        return await this.walletRepository.updateBalance(wallet);
    }


    /**
     * Fetches the wallet of a user.
     * @param userId - The ID of the user
     * @returns The wallet document for the user or null if not found
     */
    async fetchWalletByUser(userId: string): Promise<IWallet | null> {
        return await this.walletRepository.getWalletByUserId(userId);
    }
}