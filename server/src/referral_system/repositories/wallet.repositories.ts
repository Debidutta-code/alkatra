import { IWalletRepository } from "../interfaces";
import { WalletModel, IWallet } from "../models";
import { toObjectId } from "../utils";

export class WalletRepository implements IWalletRepository {

    /**
     * Creates and saves a new wallet document to the database.
     * 
     * @param wallet - Partial wallet data containing customerId and balance
     * @returns The newly created wallet document
     */
    async createWallet(wallet: Partial<IWallet>): Promise<IWallet> {
        const newWallet = new WalletModel(wallet);
        return await newWallet.save();
    }


    /**
     * Updates the balance of an existing wallet document.
     * 
     * @param wallet - Partial wallet data containing _id and new balance
     * @returns The updated wallet document or null if not found
     */
    async updateBalance(wallet: Partial<IWallet>): Promise<IWallet | null> {
        return await WalletModel.findByIdAndUpdate(
            wallet._id,
            { $set: wallet },
            { new: true }
        );
    }


    /**
     * Retrieves a wallet document by user ID.
     * 
     * @param userId - The ID of the user (string format)
     * @returns The wallet document for the specified user or null if not found
     */
    async getWalletByUserId(userId: string): Promise<IWallet | null> {
        return await WalletModel.findOne({ customerId: toObjectId(userId) });
    }
}

export default new WalletRepository();
