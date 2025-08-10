import { Request, Response } from "express";
import { IReferralService, IReferralController } from "../interfaces";
import { ValidateService } from "../services";

export class ReferralController implements IReferralController {
    constructor(private referralService: IReferralService) { }

    /**
     * Generates referral link and QR for the referrer
     * @returns referral link and QR code
     */
    async generateReferral(req: Request, res: Response) {
        try {
            const user: any = req.user;

            // Validate user ID 
            const isValid = ValidateService.validateUserId(user.id);
            if (!isValid) {
                return res.status(400).json({ error: "Invalid user ID" });
            }

            // Generate referral link and QR code
            const referral_result = await this.referralService.generateReferralLinkAndQR(user.id);

            return res.status(201).json({ referral_result });
        } catch (err) {
            console.log("Failed to generate referral code", err);
            return res.status(500).json({
                message: "Failed to generate referral code",
                error: err.message
            });
        }
    }


    /**
     * Applies a referral code to a user
     * @returns referral details
     */
    async applyReferralCode(req: Request, res: Response) {
        try {
            const referralData = req.body;

            // Apply the referrals
            const referral = await this.referralService.applyReferral(referralData);

            return res.status(201).json(referral);
        } catch (err) {
            console.log("Failed to apply referral code", err);
            return res.status(400).json({ error: err.message });
        }
    }


    /**
     * Retrieves all referrals made by a specific referrer
     * @returns list of referrals
     */
    async getReferralsByReferrer(req: Request, res: Response) {
        try {
            const { id: referrerId } = req.user as { id: string };

            // Validate user ID
            const isValid = ValidateService.validateUserId(referrerId);
            if (!isValid) return res.status(400).json({ error: "Invalid user ID" });

            // Extract pagination params with defaults
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const referrals = await this.referralService.getReferralsByReferrer({ referrerId, skip, limit });

            return res.status(200).json(referrals);
        } catch (err) {
            console.log("Failed to fetch referrals", err);
            return res.status(500).json({ error: "Unable to fetch referrals" });
        }
    }


    /**
     * Retrieves the referral record for a specific referee
     * @param refereeId - The ID of the user who was referred
     * @returns referral details
     */
    async getReferralByReferee(req: Request, res: Response) {
        try {
            const { refereeId } = req.params;
            const referral = await this.referralService.getReferralByReferee(refereeId);
            if (!referral) {
                return res.status(404).json({ error: "Referral not found" });
            }
            return res.status(200).json(referral);
        } catch (err) {
            console.log("Failed to fetch referral", err);
            return res.status(500).json({ error: "Unable to fetch referral" });
        }
    }

}
