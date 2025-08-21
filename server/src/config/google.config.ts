import { config } from "./env.variable";
import { google } from 'googleapis';

const {
    clientId,
    clientSecret,
    frontedCallbackUrl
} = config.googleServie;


class GoogleConfig {
    private static instance: GoogleConfig;
    private oauth2Client: any;

    private constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            frontedCallbackUrl
        );
    }

    static getInstance(): GoogleConfig {
        if (!GoogleConfig.instance) {
            GoogleConfig.instance = new GoogleConfig();
        }
        return GoogleConfig.instance;
    }

    public getOAuth2() {
        return google.oauth2({ version: "v2", auth: this.oauth2Client });
    }

    getOAuth2Client() {
        return this.oauth2Client;
    }
}

const googleInstance = GoogleConfig.getInstance();
export { googleInstance, GoogleConfig };