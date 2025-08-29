import { ClientSession, Types } from "mongoose";
import { referralService } from "../../../referral_system/container";
import CustomerRepository from "../repositories/customerRepository";


type ReferralDetails = {
    referrerId: string;
    refereeId: string;
    referralCode: string;
    referralLink: string;
    referralQRCode: string;
}

/**
 * R E F E R R A L   S Y S T E M
 */
export class CustomerReferralService {

    /**
     * Applies a referral code to a user and creates a new referral document in the database.
     * @param referrerId - ID of the user who is referring
     * @param refereeId - ID of the user being referred
     * @param referralCode - Referral code being applied
     */
    static async applyReferral(data: ReferralDetails): Promise<any> {
        const { referrerId, refereeId, referralCode, referralLink, referralQRCode } = data;

        if (!referrerId || !refereeId || !referralCode || !referralLink || !referralQRCode) {
            throw new Error("Required fields are missing for applying referral");
        }

        /**
         * Apply the referral by calling the referral service of referral system
         */
        const referralResult: any = await referralService.applyReferral({
            referrerId: referrerId,
            refereeId: refereeId,
            referralCode: referralCode,
            referralLink: referralLink,
            referralQRCode: referralQRCode
        });
        if (!referralResult) throw new Error("Failed to apply referral");

        return {
            message: "Referral Applied, Customer registered successfully",
            referrerId: referrerId,
            refereeId: refereeId
        };
    }


    /**
     * Check's if referrer exists and if it has referral details
     */
    static async validateReferrerForReferral(referrerId: string): Promise<any> {
        const referrer = await CustomerRepository.findById(referrerId);
        if (!referrer) throw new Error("Referrer not found");
        if (!referrer.referralCode || !referrer.referralLink || !referrer.referralQRCode) throw new Error("Referrer has no referral details.");

        return referrer;
    }

    /**
     * Check if referral code matches with referrer referral code
     */
    static matchReferralCode(referrerReferralCode: string, referralCode: string): boolean | string {
        const isValid = referrerReferralCode === referralCode;
        if (!isValid) throw new Error("Invalid referral code");
        return isValid;
    }


    /**
     * Save referrals to the customers document.
     * @param userId - ID of the user who is referring
     * @param referralCode - Referral code being applied
     * @param referralLink - Referral link generated for the user
     * @param referralQRCode - Referral QR code generated for the user
     * @return updated user document with referral details
     */
    static async updateCustomerWithReferral(
        userId: string,
        referralCode: string,
        referralLink: string,
        referralQRCode: string,
        session: ClientSession
    ): Promise<any> {
        if (!userId && !Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
        if (!referralCode || !referralLink || !referralQRCode) throw new Error("All referral details are required");

        // Update the user document with referral details
        const updatedUser = await CustomerRepository.updateReferralInfo(
            userId,
            referralCode,
            referralLink,
            referralQRCode,
            session
        );

        if (!updatedUser) {
            throw new Error("Failed to update customer with referral details");
        }

        return true;
    }


    /**
     * Find User and return referral details.
     * @param userId - ID of the user to find
     * @return referral details including referral link and QR code
     */
    static async findUserWithReferral(userId: string): Promise<any> {
        const user = await CustomerRepository.findById(userId);
        if (!user) throw new Error("User not found");

        return {
            referrerId: user._id,
            referralCode: user.referralCode,
            referralLink: user.referralLink,
            referralQRCode: user.referralQRCode
        };
    }


    /**
     * Removes referral details from a customer's document.
     * @param userId - ID of the user whose referral details are to be removed
     * @return true if referral details were successfully removed, otherwise false
     */
    static async removeReferralDetailsFromCustomer(userId: string): Promise<boolean> {
        try {
            if (!userId && !Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

            const updatedUser = await CustomerRepository.removeReferralInfo(userId);
            if (!updatedUser) {
                throw new Error("Failed to remove referral details from customer");
            }

            return true;
        } catch (error: any) {
            console.error("Error removing referral details from customer:", error);
            return false;
        }
    }

}

