import { IGoogleAuthService, IGoogleAuthData, IGoogleUserData } from "../interfaces";
import { GoogleConfig } from "../../../config";
import { GenerateVerifyUtils } from "../../../utils";
import { CustomerRepository } from "../repositories";
import { google } from "googleapis";


export class GoogleAuthService implements IGoogleAuthService {
    private static instance: GoogleAuthService;
    private googleClient: any;
    private customerRepository: any;

    private constructor(googleInstance: any) {
        this.customerRepository = CustomerRepository;
        this.googleClient = googleInstance;
        if (!this.googleClient) throw new Error("Google OAuth initialization failed");
    }

    /**
     * Get the singleton instance of GoogleAuthService.
     * @returns {GoogleAuthService} The singleton instance of GoogleAuthService.
     */
    static getInstance(googleInstance: any): GoogleAuthService {
        if (!GoogleAuthService.instance) {
            GoogleAuthService.instance = new GoogleAuthService(googleInstance);
        }
        return GoogleAuthService.instance;
    }

    /**
     * Private method to handle Google authentication for web.
     * @param {string} code - The authorization code received from Google.
     * @returns {Promise<any>} The user data returned from Google.
     */
    private async googleAuthForWeb(code: string): Promise<any> {
        let data: any;

        const { tokens } = await this.googleClient.getToken(code);
        this.googleClient.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: "v2", auth: this.googleClient });
        data = await oauth2.userinfo.get();

        return data;
    }

    /**
     * Private method to handle Google authentication for mobile.
     * @param {string} token - The access token received from Google.
     * @returns {Promise<any>} The user data returned from Google.
     */
    private async googleAuthForMobile(token: string): Promise<any> {
        let data: any;

        this.googleClient.setCredentials({ access_token: token });
        const oauth2 = google.oauth2({ version: "v2", auth: this.googleClient });
        data = await oauth2.userinfo.get();

        return data;
    }





    /**
     * Authenticate a user using Google OAuth.
     */
    async authenticate(data: IGoogleAuthData): Promise<IGoogleUserData> {
        try {
            const { code, token } = data;
            if (!code && !token) throw new Error("Code or token is required for Google authentication");

            let userData: any;

            /**
             * Get user data based on whether a code or token is provided.
             */
            code ?
                (userData = await this.googleAuthForWeb(code as string)) :
                (userData = await this.googleAuthForMobile(token as string));

            if (!userData) throw new Error("Failed to retrieve user data from Google");

            /**
             * Check if the user already exists in the database. 
             * If not, create a new customer record.
             */
            const { id, given_name, family_name, email, picture } = userData.data;

            let customer = await this.customerRepository.findByEmail(email);
            if (!customer) {
                customer = await this.customerRepository.create({
                    googleId: id,
                    firstName: given_name,
                    lastName: family_name,
                    email: email,
                    avatar: picture,
                    provider: data.provider,
                });
            }

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
            }
        }
        catch (error: any) {
            console.error("Google authentication failed:", error);
            throw error.message;
        }
    }

}

// const googleAuthService = GoogleAuthService.getInstance();
// export { googleAuthService, GoogleAuthService };
