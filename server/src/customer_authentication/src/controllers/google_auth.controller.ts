import { Request, Response } from "express";
import { IGoogleAuthController, IGoogleAuthService, AuthenticatedRequest } from "../interfaces";
import { CustomerRepository } from "../repositories";


export class GoogleAuthController implements IGoogleAuthController {
    private googleAuthService: IGoogleAuthService;
    private customerRepository: any;

    constructor(googleAuthService: IGoogleAuthService) {
        this.googleAuthService = googleAuthService;
        this.customerRepository = CustomerRepository;
    }



    /**
     * Handles Google OAuth authentication requests.
     */
    async authenticate(req: Request, res: Response): Promise<Response> {
        try {
            const provider = req.body.provider;
            if (!provider) throw new Error("Auth Provider is required");

            const data = {
                code: req.body.code,
                token: req.body.token,
                provider: provider
            };

            const userData = await this.googleAuthService.authenticate(data);
            if (!userData) throw new Error("Failed to authenticate with Google");

            return res.status(200).json(userData);
        } 
        catch (error: any) {
            console.log("Failed to authenticate with Google:", error);
            return res.status(500).json({ error: error.message });
        }
    }


    /**
     * Retrieves user information based on the provided user ID.
     */
    async getUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new Error("User ID is required to get user information");

            const user = await this.customerRepository.getUserById(userId);
            if (!user) throw new Error("User not found");

            return res.status(200).json(user);
        } catch (error: any) {
            console.log("Failed to get user:", error);
            if (
                error.message === "User not found" ||
                error.message === "User ID is required to get user information"
            ) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Failed to get user" });
        }   
    }

}