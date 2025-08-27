import QRCode from "qrcode";
import { Types } from "mongoose";
import { nanoid } from "nanoid";
import { config } from "../../config";

export class GenerateUtils {

    public static toObjectId(id: string): Types.ObjectId {
        return new Types.ObjectId(id);
    }


    public static async generateQRCode(text: string): Promise<string> {
        try {
            return await QRCode.toDataURL(text);
        } catch (error) {
            throw new Error("Failed to generate QR code");
        }
    }


    public static async generateReferrals(userId: string) {
        const referralCode = `${userId.slice(0, 5)}${nanoid(4)}`;
        const referralLink = `${config.referralSystem.referralLinkBaseUrl}?referrerId=${userId}&referralCode=${referralCode}`;
        const referralQRCode = await this.generateQRCode(referralLink);
        return { referralCode, referralLink, referralQRCode };
    }


    public static referralSuccessMessage(referrerId: string, referralLink: string, referralQRCode: string) {
        return {
            message: "Referral link generated successfully",
            referrerId: referrerId,
            referral_link: referralLink,
            referral_qr_code: referralQRCode
        };
    }

}