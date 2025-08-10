import { Types } from "mongoose";
import { IReferralData } from "../interfaces";

export class ValidateService {

    private static validateMongoId = (mongoId: string): boolean | string => {
        if (!mongoId || !Types.ObjectId.isValid(mongoId)) throw new Error("Invalid ID");
        return true;
    }

    static validateUserId = (userId: string): boolean => {
        if (!userId || !this.validateMongoId(userId)) return false;
        return true;
    }

    static validateReferralData = (referralData: IReferralData): string | void => {
        const { referrerId, refereeId, referralCode, referralLink, referralQRCode } = referralData;

        if (!referrerId || !this.validateMongoId(referrerId)) throw new Error("Invalid referrer ID");
        if (refereeId && !this.validateMongoId(refereeId)) throw new Error("Invalid referee ID");
        if (!referralCode || typeof referralCode !== "string") throw new Error("Invalid referral code");
        if (!referralLink || typeof referralLink !== "string") throw new Error("Invalid referral link");
        if (!referralQRCode || typeof referralQRCode !== "string") throw new Error("Invalid referral QR code");
    }

    static validateReferralCodeAndReferrerId = (referrerId: string, referralCode: string): void => {
        if (!this.validateUserId(referrerId)) throw new Error("Invalid referrer ID");

        if (!referralCode || typeof referralCode !== "string") throw new Error("Invalid referral code");
    }

}