import { GoogleAuthService } from "./services";
import { GoogleAuthController } from "./controllers";
import { AppleAuthService } from "./services/appleAuth.service";
import { AppleAuthController } from "./controllers/appleAuth.controller";
import { GoogleConfig } from "../../config";

const googleInstance = GoogleConfig.getInstance();
const googleAuthService = GoogleAuthService.getInstance(googleInstance.getOAuth2Client());
const googleAuthController = new GoogleAuthController(googleAuthService);

const appleAuthService = AppleAuthService.getInstance();
const appleAuthController = new AppleAuthController(appleAuthService);

export const customer_authentication_container = {
    googleAuthService,
    googleAuthController,
    appleAuthService,
    appleAuthController
}