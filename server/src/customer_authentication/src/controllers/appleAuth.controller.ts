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
            const { provider, identityToken, authorizationCode, firstName, lastName, email, nonce } = req.body;

            // Log incoming request for debugging (remove in production)
            console.log('Apple auth request received:', {
                hasIdentityToken: !!identityToken,
                hasAuthorizationCode: !!authorizationCode,
                hasFirstName: !!firstName,
                hasLastName: !!lastName,
                hasEmail: !!email,
                hasNonce: !!nonce,
                provider
            });

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
                lastName,
                nonce
            });
            
            if (!userData) {
                return res.status(401).json({ error: "Failed to authenticate with Apple" });
            }

              // ADD DETAILED LOGGING HERE - RIGHT AFTER SUCCESSFUL AUTHENTICATION
        console.log('=== BACKEND RESPONSE TO FRONTEND ===');
        console.log('Complete userData object:', JSON.stringify(userData, null, 2));
        console.log('Token present:', !!userData.token);
        console.log('Token value:', userData.token);
        console.log('User object:', JSON.stringify(userData.user, null, 2));
        if (userData.user) {
            console.log('User details:');
            console.log('  - ID:', userData.user.id);
            console.log('  - First Name:', userData.user.firstName);
            console.log('  - Last Name:', userData.user.lastName);
            console.log('  - Email:', userData.user.email);
            console.log('  - Provider:', userData.user.provider);
            console.log('  - Avatar:', userData.user.avatar);
        }
        console.log('=====================================');


            // Log successful authentication
            console.log('Apple authentication successful:', {
                userId: userData.user.id,
                hasEmail: !!userData.user.email,
                provider: userData.user.provider
            });

            // If no referral information, return user data directly
            if (!referrerId && !referralCode) {
                console.log('No referral data - returning user data directly');
            console.log('Final response to frontend:', JSON.stringify(userData, null, 2));
                return res.status(201).json(userData);
            }

            // Validate referral information
            const validatedReferrer = await CustomerReferralService.validateReferrals(referrerId, referralCode);

            // Check if user is trying to refer themselves
            if (userData.user.id?.toString() === referrerId) {
                console.log('User attempting to refer themselves, skipping referral');
                console.log('Final response to frontend (self-referral):', JSON.stringify(userData, null, 2));
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
                console.log('Final response to frontend (referral failed):', JSON.stringify(userData, null, 2));
                return res.status(201).json(userData);
            }

            // Add token to referral result
            referralResult.token = userData.token;
         console.log('Referral successful - Final response to frontend:', JSON.stringify(referralResult, null, 2));
            return res.status(201).json(referralResult);
        } catch (error: any) {
            console.error("Apple authentication error:", error.message);
            console.error("Error stack:", error.stack);
            
            // More specific error handling
            if (error.message.includes('Invalid') || error.message.includes('token') || error.message.includes('verification')) {
                return res.status(401).json({ error: error.message || "Invalid Apple authentication token" });
            }
            
            if (error.message.includes('required') || error.message.includes('Provider') || error.message.includes('missing')) {
                return res.status(400).json({ error: error.message || "Missing required authentication data" });
            }

            if (error.message.includes('Apple user identifier') || error.message.includes('sub')) {
                return res.status(400).json({ error: "Apple user identifier is required but not provided" });
            }
            
            // Generic server error for unknown issues
            return res.status(500).json({ 
                error: "Apple authentication failed",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
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