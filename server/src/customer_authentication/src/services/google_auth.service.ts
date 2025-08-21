import { google } from "googleapis";
import { GoogleConfig, googleInstance } from "../../../config";
import { GenerateVerifyUtils } from "../../../utils";
import { CustomerRepository } from "../repositories";

interface IGoogleAuthData {
    code?: string;
    token?: string;
}

class GoogleAuthService {
    private static instance: GoogleAuthService;
    private googleClient: any;
    private customerRepository: any;

    private constructor() {
        this.customerRepository = CustomerRepository;
        this.googleClient = googleInstance.getOAuth2Client();
        if (!this.googleClient) throw new Error("Google OAuth initialization failed");
    }

    /**
     * Get the singleton instance of GoogleAuthService.
     * @returns {GoogleAuthService} The singleton instance of GoogleAuthService.
     */
    static getInstance(): GoogleAuthService {
        if (!GoogleAuthService.instance) {
            GoogleAuthService.instance = new GoogleAuthService();
        }
        return GoogleAuthService.instance;
    }




    private async googleAuthForWeb(code: string) {
        let data: any;

        const { tokens } = this.googleClient.getToken(code);
        console.log("Tokens received:", tokens);
        this.googleClient.setCredentials(tokens);
        // const oauth2 = this.googleClient.getOAuth2();
        const oauth2 = google.oauth2({ version: "v2", auth: this.googleClient })
        console.log("#### OAUTH2: ", oauth2);
        data = await oauth2.userinfo.get();

        console.log("Exiting googleAuthForWeb with data:", data);
        return data;
    }

    private async googleAuthForMobile(token: string) {
        let data: any;

        this.googleClient.setCredentials({ access_token: token });
        // const oauth2 = this.googleClient.getOAuth2();
        const oauth2 = google.oauth2({ version: "v2", auth: this.googleClient })
        data = await oauth2.userinfo.get();

        return data;
    }



    /**
     * Handle the post request for Google authentication data.
     * @param data - The data containing either a code or a token for Google authentication.
     */
    async handlePostGoogleAuthData(data: IGoogleAuthData) {
        const { code, token } = data;
        console.log("Code received:", code);
        console.log("Token received:", token);

        if (!code && !token) throw new Error("Authorization code or token is required");

        let userData: any;

        /**
         * Get user data based on whether a code or token is provided.
         * If a code is provided, it will handle Google authentication for web.
         * If a token is provided, it will handle Google authentication for mobile.
         */
        if (code) {
            console.log("Handling Google authentication for web");
            userData = await this.googleAuthForWeb(code);
            if (!userData) throw new Error("Google web authentication failed");
            console.log("🟢 EXITING IF BLOCK FOR WEB");
        }
        if (token) {
            console.log("Handling Google authentication for mobile");
            userData = await this.googleAuthForMobile(token);
            if (!userData) throw new Error("Google mobile authentication failed");
            console.log("🟢 EXITING IF BLOCK FOR MOBILE");
        }

        const { id, given_name, family_name, email, picture } = userData.data;

        /**
         * Check if a customer with the provided email exists.
         * If not, create a new customer with the provided Google data.
         */
        let customer = await this.customerRepository.findByEmail(email);

        if (!customer) {
            customer = await this.customerRepository.create({
                googleId: id,
                firstName: given_name,
                lastName: family_name,
                email: email,
                avatar: picture,
            });
        }

        /**
         * Generate a JWT token for the customer.
         */
        const tokenData = GenerateVerifyUtils.generateToken({ id: customer._id })

        return {
            token: tokenData,
            user: {
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                avatar: customer.avatar
            }
        }
    }

}

const googleAuthService = GoogleAuthService.getInstance();
export { googleAuthService, GoogleAuthService };