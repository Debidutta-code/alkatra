import {
    IReferralData,
    IGenerateReferralPayload,
    IReferralRepository,
    IReferralService,
    IWalletService,
    IReferralRequest
} from "../interfaces";
import { GenerateUtils } from "../utils";
import { CustomerReferralService } from "../../customer_authentication/src/services";
import { ValidateService } from "../services"
import { config } from "../../config";
import mongoose from "mongoose";


export class ReferralService implements IReferralService {
    private referralRepository: IReferralRepository;
    private walletService: IWalletService;

    constructor(
        referralRepository: IReferralRepository,
        walletService: IWalletService
    ) {
        this.referralRepository = referralRepository;
        this.walletService = walletService;
    }


    /**
     * Generates a unique referral link and QR code for a user.
     * If a referral already exists for the user, it returns the existing referral link and QR code.
     * @param userId - The ID of the user for whom to generate a referral link and QR code.
     * @returns An object containing the referral link and QR code, or a message if the referral already exists.
     */
    async generateReferralLinkAndQR(userId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const referrals: IGenerateReferralPayload = await CustomerReferralService.findUserWithReferral(userId);

            // If referral details already exist, return them
            if (referrals?.referralLink && referrals?.referralQRCode) {
                return GenerateUtils.referralSuccessMessage(userId, referrals.referralLink, referrals.referralQRCode);
            }

            // Step 1: Generate a unique referrals
            const { referralCode, referralLink, referralQRCode } = await GenerateUtils.generateReferrals(userId);

            // Step 2: Save the referrals to the customer database
            const isUserUpdated: boolean = await CustomerReferralService.updateCustomerWithReferral(userId, referralCode, referralLink, referralQRCode);
            if (!isUserUpdated) throw new Error("Failed to update user with referral details");

            /**
             * Step 3: Create a new Wallet for referrer
             * But ensure that a wallet does not already exist for the user
             */
            const existingWallet = await this.walletService.fetchWalletByUser(userId);

            /**
             * If a wallet already exists, return the existing referral link and QR code
             * to avoid creating duplicate wallets.
             */
            if (existingWallet) return GenerateUtils.referralSuccessMessage(userId, referralLink, referralQRCode);


            /**
             * If no wallet exists, create a new wallet for the user
             */
            await this.walletService.initializeWallet(userId, session);
            // if (!wallet) {
            //     await CustomerReferralService.removeReferralDetailsFromCustomer(userId);
            //     throw new Error("Failed to create wallet for user");
            // }

            return GenerateUtils.referralSuccessMessage(userId, referralLink, referralQRCode);
        }
        catch (error: any) {
            await session.abortTransaction();
            session.endSession();
            console.error("Failed to generate referral link and QR code:", error);
            throw new Error("Unable to generate referrals at this moment. Please try again later.");
        }
        finally {
            await session.commitTransaction();
            session.endSession();
        }
    }


    /**
     * Applies a referral code to a user and creates a new referral document in the database.
     * If a referral already exists between the referrer and referee, it throws an error.
     * @param referrerId - The ID of the user who is referring.
     * @param refereeId - The ID of the user being referred.
     * @param referralCode - The referral code being applied.
     * @returns The created referral document.
     * @throws Error if a referral already exists between the referrer and referee.
     */
    async applyReferral(referralData: IReferralData) {
        // Step 1: Validate referral data
        ValidateService.validateReferralData(referralData);

        // Step 2: Check if the referrer exists
        const existingReferral = await this.referralRepository.findByReferrerAndReferee(referralData.referrerId, referralData.refereeId);
        if (existingReferral) throw new Error("Referral already exists between these users");

        // Step 3: Create a new referral document
        const newReferral = await this.referralRepository.createReferral({
            referrerId: GenerateUtils.toObjectId(referralData.referrerId),
            refereeId: GenerateUtils.toObjectId(referralData.refereeId),
            referralCodeUsed: referralData.referralCode,
            referralLink: referralData.referralLink,
            referralQRCode: referralData.referralQRCode,
        });
        if (!newReferral) throw new Error("Failed to create referral");

        // Step 4: Generate wallet amount for referee        
        await this.walletService.addBalanceToWallet(referralData.referrerId.toString(), config.referralSystem.referRewardAmount);

        // Generate a reward for the referrer
        // await this.rewardService.generateReward(referralData.refereeId, newReferral._id.toString(), "cash");

        return newReferral;
    }


    /**
     * Retrieves all referrals made by a specific referrer, sorted by creation date (newest first).
     * @param referrerId - The ID of the referrer whose referrals are to be retrieved.
     * @returns An array of referral documents made by the specified referrer.
     */
    async getReferralsByReferrer(payload: IReferralRequest) {
        return await this.referralRepository.findByReferrerId(payload);
    }


    /**
     * Finds a referral record where the specified user is the referee.
     * @param refereeId - The ID of the user who is the referee.
     * @returns The referral document if found, or null if not found.
     */
    async getReferralByReferee(refereeId: string) {
        return await this.referralRepository.findByRefereeId(refereeId);
    }

}
