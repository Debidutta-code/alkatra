import { IAppleAuthService, IAppleAuthData, IAppleUserData } from "../interfaces";
import { GenerateVerifyUtils } from "../../../utils";
import { AppleAuthRepository } from "../repositories";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import crypto from 'crypto';

export class AppleAuthService implements IAppleAuthService {
    private static instance: AppleAuthService;
    private appleConfig: any;
    private appleAuthRepository: AppleAuthRepository;

    private constructor() {
        this.appleAuthRepository = new AppleAuthRepository();
        this.appleConfig = {
            clientId: process.env.APPLE_CLIENT_ID,
            teamId: process.env.APPLE_TEAM_ID,
            keyId: process.env.APPLE_KEY_ID,
            privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            redirectUri: process.env.APPLE_REDIRECT_URI
        };
    }

    /**
     * Get the singleton instance of AppleAuthService.
     */
    static getInstance(): AppleAuthService {
        if (!AppleAuthService.instance) {
            AppleAuthService.instance = new AppleAuthService();
        }
        return AppleAuthService.instance;
    }

    /**
     * Verify Apple identity token using Apple's public keys
     */
    private async verifyIdentityToken(identityToken: string, expectedNonce?: string): Promise<any> {
        try {
            // Apple's public keys URL
            const applePublicKeysUrl = 'https://appleid.apple.com/auth/keys';
            
            // Get Apple's public keys
            const response = await axios.get(applePublicKeysUrl);
            const keys = response.data.keys;
            
            // Decode the token header to get the key ID
            const decodedHeader = jwt.decode(identityToken, { complete: true })?.header;
            
            if (!decodedHeader || !decodedHeader.kid) {
                throw new Error('Invalid identity token header');
            }
            
            // Find the matching key
            const key = keys.find((k: any) => k.kid === decodedHeader.kid);
            
            if (!key) {
                throw new Error('Matching Apple public key not found');
            }
            
            // Convert JWK to PEM format
            const publicKey = this.jwkToPem(key);
            
            // Verify the token with proper options
            const verifiedToken = jwt.verify(identityToken, publicKey, {
                algorithms: ['RS256'],
                audience: this.appleConfig.clientId,
                issuer: 'https://appleid.apple.com'
            })as jwt.JwtPayload;
            
// --- CRITICAL NONCE VALIDATION ---
            if (expectedNonce) {
                // The nonce in the token is a SHA256 hash of the original nonce
                const nonceClaim = verifiedToken.nonce;
                if (!nonceClaim) {
                    throw new Error('Nonce claim is missing from the identity token. Potential replay attack.');
                }
                // You must hash the original nonce the same way the Flutter app did (SHA256 -> base64Url)
                const expectedNonceHash = crypto.createHash('sha256').update(expectedNonce).digest('base64url');
                if (nonceClaim !== expectedNonceHash) {
                    throw new Error('Nonce validation failed. Token may be reused.');
                }
            } else {
                // If you expect a nonce but none was provided, it's a security warning.
                // For maximum security, you might require it. For now, we'll just log.
                console.warn('No nonce provided for validation. Security recommendation: always use a nonce.');
            }
            // ---------------------------------

            return verifiedToken;
        } catch (error: any) {
            console.error('Apple identity token verification failed:', error.message);
            throw new Error(`Invalid Apple identity token: ${error.message}`);
        }
    }

    /**
     * Convert JWK (JSON Web Key) to PEM format
     */
    private jwkToPem(jwk: any): string {
        try {
            // Convert base64url to standard base64
            const modulus = Buffer.from(jwk.n, 'base64url');
            const exponent = Buffer.from(jwk.e, 'base64url');
            
            // Create the RSA public key using Node.js crypto
            const key = crypto.createPublicKey({
                key: {
                    kty: jwk.kty,
                    n: jwk.n,
                    e: jwk.e
                },
                format: 'jwk'
            });
            
            return key.export({ type: 'spki', format: 'pem' }) as string;
        } catch (error: any) {
            console.error('Failed to convert JWK to PEM:', error.message);
            throw new Error('Failed to process Apple public key');
        }
    }

    /**
     * Exchange authorization code for access token
     */
    private async exchangeCodeForToken(authorizationCode: string): Promise<any> {
        try {
            // Create client secret JWT
            const now = Math.floor(Date.now() / 1000);
            const clientSecret = jwt.sign(
                {
                    iss: this.appleConfig.teamId,
                    iat: now,
                    exp: now + (6 * 30 * 24 * 60 * 60), // 6 months
                    aud: 'https://appleid.apple.com',
                    sub: this.appleConfig.clientId
                },
                this.appleConfig.privateKey,
                {
                    algorithm: 'ES256',
                    keyid: this.appleConfig.keyId,
                    header: {
                        kid: this.appleConfig.keyId,
                        alg: 'ES256'
                    }
                }
            );

            // Prepare form data
            const formData = new URLSearchParams({
                client_id: this.appleConfig.clientId,
                client_secret: clientSecret,
                code: authorizationCode,
                grant_type: 'authorization_code',
                redirect_uri: this.appleConfig.redirectUri || ''
            });

            // Exchange code for token
            const response = await axios.post('https://appleid.apple.com/auth/token', formData.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Failed to exchange authorization code:', error.response?.data || error.message);
            throw new Error(`Failed to exchange authorization code: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Authenticate a user using Apple Sign-In
     */
    async authenticate(data: IAppleAuthData): Promise<IAppleUserData> {
        try {
            const { identityToken, authorizationCode, firstName, lastName,nonce} = data;
            
            if (!identityToken && !authorizationCode) {
                throw new Error("Either identity token or authorization code is required for Apple authentication");
            }

            let appleUserData: any;

            if (identityToken) {
                // Verify identity token directly
                appleUserData = await this.verifyIdentityToken(identityToken, nonce);
            } else if (authorizationCode) {
                // Exchange authorization code for tokens
                const tokens = await this.exchangeCodeForToken(authorizationCode);
                if (!tokens.id_token) {
                    throw new Error("No identity token received from Apple");
                }
                appleUserData = await this.verifyIdentityToken(tokens.id_token, nonce);
            }

            if (!appleUserData) {
                throw new Error("Failed to retrieve user data from Apple");
            }

            // Extract user information from verified token
            const { email, sub: appleId, email_verified } = appleUserData;

            if (!email || !appleId) {
                throw new Error("Required user information not available from Apple");
            }

            // Check if user exists by Apple ID or email
            let customer = await this.appleAuthRepository.findUserByEmailOrAppleId(email, appleId);
            
            if (!customer) {
                // Create new customer
                customer = await this.appleAuthRepository.createUser({
                    appleId: appleId,
                    firstName: firstName || 'Apple',
                    lastName: lastName || 'User',
                    email: email,
                    provider: 'apple',
                });
            } else if (!customer.appleId && customer.email === email) {
                // Link Apple account to existing email-based account
                customer = await this.appleAuthRepository.updateUserById(customer._id.toString(), {
                    appleId: appleId,
                    provider: 'apple'
                });
            }

            if (!customer) {
                throw new Error("Failed to create or update customer");
            }

            // Generate JWT token
            const jwtToken = GenerateVerifyUtils.generateToken({ id: customer._id });

            return {
                token: jwtToken,
                user: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    avatar: customer.avatar,
                    provider: customer.provider
                }
            };
        } catch (error: any) {
            console.error("Apple authentication failed:", error.message);
            throw new Error(error.message || "Apple authentication failed");
        }
    }
}