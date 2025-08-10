import { 
    IReferralData, 
    IGenerateReferralPayload, 
    IReferralRepository, 
    IReferralService, 
    IWalletService, 
    IReferralRequest 
} from "../interfaces";
import { toObjectId, generateQRCode } from "../utils";
import { nanoid } from "nanoid";
import { CustomerReferralService } from "../../customer_authentication/src/services";
import { ValidateService } from  "../services"
import { config } from "../../config";


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
        const referrals: IGenerateReferralPayload = await CustomerReferralService.findUserWithReferral(userId);

        if (referrals.referralLink !== undefined && referrals.referralQRCode !== undefined) {
            return {
                message: "Referral link already exists",
                referrerId: userId,
                referral_link: referrals.referralLink,
                referral_qr_code: referrals.referralQRCode
            };
        }

        // Step 1: Generate a unique referrals
        const referralCode = `${userId.slice(0, 5)}${nanoid(4)}`;
        const referralLink = `${config.referralSystem.referralLinkBaseUrl}?referrerId=${userId}&referralCode=${referralCode}`;
        const referralQRCode = await generateQRCode(referralLink);

        // Step 2: Save the referrals to the customer database
        const isUserUpdated: boolean = await CustomerReferralService.updateCustomerWithReferral(
            userId,
            referralCode,
            referralLink,
            referralQRCode
        );
        if (!isUserUpdated) throw new Error("Failed to update user with referral details");

        // Step 3: Create a new Wallet for referrer
        await this.walletService.initializeWallet(userId);

        // Step 4: Create a new Reward document for referrer

        return {
            message: "Referral link generated successfully",
            referrerId: userId,
            referral_link: referralLink,
            referral_qr_code: referralQRCode
        };
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
            referrerId: toObjectId(referralData.referrerId),
            refereeId: toObjectId(referralData.refereeId),
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
