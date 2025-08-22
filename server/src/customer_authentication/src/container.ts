import { GoogleAuthService } from "./services";
import { GoogleAuthController } from "./controllers";
import { GoogleConfig } from "../../config";


const googleInstance = GoogleConfig.getInstance();
const googleAuthService = GoogleAuthService.getInstance(googleInstance);
const googleAuthController = new GoogleAuthController(googleAuthService);

export const customer_authentication_container = {
    googleAuthService,
    googleAuthController
}