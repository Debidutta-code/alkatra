import { Request, Response } from "express";
import { IWalletService, IWalletController } from "../interfaces";

export class WalletController implements IWalletController {
    private walletService: IWalletService;

    constructor(walletService: IWalletService) {
        this.walletService = walletService;
    }

    
    /**
     * Handles wallet creation for a user.
     */
    async handleWalletCreation(req: Request, res: Response) {
        const { userId } = req.body;
        try {
            const wallet = await this.walletService.initializeWallet(userId);
            return res.status(201).json(wallet);
        } catch (err) {
            console.log("Failed to create wallet", err);
            return res.status(500).json({ error: "Failed to create wallet" });
        }
    }


    /**
     * Handles wallet balance update for a user when user get's referral bonus.
     */
    async handleBalanceIncrement(req: Request, res: Response) {
        const { id } = req.user as { id: string };
        const { amount } = req.body;
        try {
            const updatedWallet = await this.walletService.modifyWalletBalance(id, amount);
            return res.status(200).json(updatedWallet);
        } catch (err) {
            console.log("Failed to update wallet balance", err);
            return res.status(400).json({ error: err.message });
        }
    }


    /**
     * Handles updating the wallet balance for a user.
     * In case of user chooses to redeem their wallet balance.
     */
    async handleRedeemption(req: Request, res: Response) {
        const { id } = req.user as { id: string };
        const { amount } = req.body;
        try {
            const updatedWallet = await this.walletService.redeemBalanceFromWallet(id, amount);
            return res.status(200).json(updatedWallet);
        } catch (err) {
            console.log("Failed to redeem wallet balance", err);
            return res.status(400).json({ error: err.message });
        }
    }


    /**
     * Handles fetching the wallet details for a user.
     */
    async handleFetchWallet(req: Request, res: Response) {
        const { id: userId } = req.user as { id: string };
        try {
            const wallet = await this.walletService.fetchWalletByUser(userId);
            if (!wallet) {
                return res.status(404).json({ error: "Wallet not found" });
            }
            return res.status(200).json(wallet);
        } catch (err) {
            console.log("Failed to fetch wallet", err);
            return res.status(500).json({ error: "Failed to fetch wallet" });
        }
    }
}