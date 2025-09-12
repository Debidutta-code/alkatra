import { Request, Response } from "express";
import { IAppleAuthController, IAppleAuthService, AuthenticatedRequest } from "../interfaces";
import { AppleAuthRepository } from "../repositories";
import { CustomerReferralService } from "../services";

export class AppleAuthController implements IAppleAuthController {
    private appleAuthService: IAppleAuthService;
    private appleAuthRepository: AppleAuthRepository;

    constructor(appleAuthService: IAppleAuthService) {
        this.appleAuthService = appleAuthService;
        this.appleAuthRepository = new AppleAuthRepository();
    }

    /**
     * Handles Apple Sign-In authentication requests.
     */
    async authenticate(req: Request, res: Response): Promise<Response> {
        try {
            const { referrerId, referralCode } = req.query as { referrerId: string; referralCode: string };
            const { provider, identityToken, authorizationCode, firstName, lastName, email } = req.body;

            // Validate required fields
            if (!provider || provider !== 'apple') {
                return res.status(400).json({ error: "Provider must be 'apple'" });
            }

            if (!identityToken && !authorizationCode) {
                return res.status(400).json({ 
                    error: "Either identityToken or authorizationCode is required for Apple authentication" 
                });
            }

            // Authenticate with Apple
            const userData = await this.appleAuthService.authenticate({ 
                provider, 
                identityToken, 
                authorizationCode, 
                firstName, 
                lastName 
            });
            
            if (!userData) {
                return res.status(401).json({ error: "Failed to authenticate with Apple" });
            }

            // If no referral information, return user data directly
            if (!referrerId && !referralCode) {
                return res.status(201).json(userData);
            }

            // Validate referral information
            const validatedReferrer = await CustomerReferralService.validateReferrals(referrerId, referralCode);

            // Check if user is trying to refer themselves
            if (userData.user.id?.toString() === referrerId) {
                return res.status(201).json(userData);
            }

            // Apply referral code
            const referralResult = await CustomerReferralService.applyReferral({
                referrerId: referrerId,
                refereeId: userData.user.id as string,
                referralCode: referralCode,
                referralLink: validatedReferrer.referralLink,
                referralQRCode: validatedReferrer.referralQRCode
            });

            if (!referralResult) {
                // If referral fails, still return user data without referral
                console.warn("Referral application failed, but user authentication succeeded");
                return res.status(201).json(userData);
            }

            // Add token to referral result
            referralResult.token = userData.token;

            return res.status(201).json(referralResult);
        } catch (error: any) {
            console.error("Apple authentication error:", error.message);
            
            // Return appropriate error status
            if (error.message.includes('Invalid') || error.message.includes('token')) {
                return res.status(401).json({ error: error.message });
            }
            
            if (error.message.includes('required') || error.message.includes('Provider')) {
                return res.status(400).json({ error: error.message });
            }
            
            return res.status(500).json({ error: "Apple authentication failed" });
        }
    }

    /**
     * Retrieves user information based on the provided user ID.
     */
    async getUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "User ID is required to get user information" });
            }

            const user = await this.appleAuthRepository.findUserById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Return user data without sensitive information
            const userResponse = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar,
                provider: user.provider,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            return res.status(200).json(userResponse);
        } catch (error: any) {
            console.error("Failed to get user:", error.message);
            return res.status(500).json({ error: "Failed to retrieve user information" });
        }
    }
}