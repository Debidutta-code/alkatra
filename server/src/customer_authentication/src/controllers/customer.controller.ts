// src/controllers/customerController.ts
import { Request, Response } from "express";
import customerService from "../services/customerService";
import { AuthenticatedRequest } from "../types/custom";

// Referral Service
import { CustomerReferralService } from "../services";
import { ValidateService } from "../../../referral_system/services/validate.service";
import { IUserMessage } from "../models";
import { AuthController } from "../controllers/googleSocialAuth.controller";
import { googleAuthService } from "../services";

class CustomerController {

    googleAuthController = new AuthController();


    private async registerUsers(provider: string, data: any): Promise<any> {
        switch (provider) {
            case 'local':
                return customerService.registerCustomer(data);
            case 'google':
                return googleAuthService.handlePostGoogleAuthData({ ...data, provider: provider });
            default:
                throw new Error(`Unknown auth provider: ${provider}`);
        }
    }


    /**
     * Register a new customer
     * 
     * This function handles the registration of a customer based on the provided authentication provider.
     * It checks the authProvider from the request body and calls the appropriate registration method.
     */
    async registerCustomer(req: Request, res: Response): Promise<Response | void> {
        try {
            const { referrerId, referralCode } = req.query as { referrerId: string; referralCode: string };
            // const provider = req.body.provider;
            const { provider, ...userBody } = req.body;
            
            /**
             * Register the customer if referrerId and referralCode are not provided
             */
            if (!referrerId && !referralCode) {
                // const customer = await customerService.registerCustomer(userBody);
                const customer = await this.registerUsers(provider, userBody);
                return res.status(201).json({ message: "Customer registered successfully", data: customer });
            }


            /**
             * Validate the referrerId and referralCode
             */
            ValidateService.validateReferralCodeAndReferrerId(referrerId, referralCode);

            /**
             * Check if the referrer exists and if the referral code matches with referrer referral code
             */
            const validatedReferrer = await CustomerReferralService.validateReferrerForReferral(referrerId);

            /**
             * Match referral code with referrer referral code
             */
            CustomerReferralService.matchReferralCode(validatedReferrer.referralCode, referralCode);

            /**
             * Now all check's are passed to register the referee
             */
            // const referee = await customerService.registerCustomer(userBody);
            let referee: any;
            const result = await this.registerUsers(provider, userBody);
            provider === 'local' ? referee = result : referee = result.user;

            if (!referee) throw new Error("Unable to register, please again later.");

            /**
             * Apply the referral code to the customer
             */
            let referralResult = await CustomerReferralService.applyReferral({
                referrerId: referrerId,
                refereeId: provider === 'local' ? referee._id : referee.id,
                referralCode: referralCode,
                referralLink: validatedReferrer.referralLink,
                referralQRCode: validatedReferrer.referralQRCode
            });

            if (provider === 'google') {
                referralResult.data.token = result.token;
                referralResult.data.user = result.user;
            } else {
                referralResult.token = result.token;
                referralResult.user = result.user;
            }

            return res.status(201).json(referralResult);
        }
        catch (error: any) {
            const statusCode = error.message === "Customer already registered" ? 400 : 500;
            return res.status(statusCode).json({ message: error.message });
        }
    }

    // Customer login
    async loginCustomer(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { token, customer } = await customerService.loginCustomer(email, password);
            res.status(200).json({
                message: "Login successful",
                token,
                data: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    role: customer.role,
                },
            });
        } catch (error: any) {
            try {
                const parsedError = JSON.parse(error.message);
                res.status(400).json(parsedError);
            } catch (e) {
                res.status(400).json({ message: error.message });
            }
        }
    }

    // Get all customers
    async getAllCustomers(req: Request, res: Response): Promise<void> {
        try {
            const customers = await customerService.getAllCustomers();
            res.status(200).json({ message: "Customers retrieved successfully", data: customers });
        } catch (error) {
            res.status(500).json({ message: "Error retrieving customers", error });
        }
    }

    // get customer by ID
    async getCustomerOwnData(req: Request, res: Response): Promise<void> {
        try {
            const token = req.header("Authorization")?.split(" ")[1];
            if (!token) {
                res.status(401).json({ message: "Access denied. No token provided." });
                return;
            }
            const customer = await customerService.getCustomerOwnData(token);
            if (!customer) {
                res.status(404).json({ message: "Customer not found" });
                return;
            }
            res.status(200).json({ message: "Customer retrieved successfully", data: customer });
        } catch (error) {
            console.log(`Faild to get customer data at getCustomerOwnData ${error}`);
            res.status(500).json({ message: "Error retrieving customer", error });
        }
    }

    // Update customer profile
    async updateCustomerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { firstName, lastName, phone, email, password } = req.body;
            const customerId = req.user?.id;

            if (!customerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const customer = await customerService.updateCustomerProfile(customerId, { firstName, lastName, phone, email, password });
            if (!customer) {
                res.status(404).json({ message: "Customer not found" });
                return;
            }

            res.status(200).json({ message: "Profile updated successfully", data: customer });
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === "Email already exists") {
                    res.status(400).json({ message: error.message });
                } else {
                    res.status(500).json({ message: "Error updating profile", error });
                }
            } else {
                res.status(500).json({ message: "An unknown error occurred" });
            }
        }
    }

    // Check if email exists
    async checkEmailExists(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            const result = await customerService.checkEmailExists(email);
            res.status(200).json({ message: "You are authorized", ...result });
        } catch (error: any) {
            const status = error.message === "Email not found" ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    // Update customer password
    async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { email, newPassword } = req.body;

            await customerService.updatePassword(email, newPassword);
            res.status(200).json({ message: "Password updated successfully" });
        } catch (error: any) {
            const statusMap: Record<string, number> = {
                "Customer not found": 404,
                "Unauthorized: No customer ID provided": 401,
                "You are not allowed to update this password": 403,
                "Email and new password are required": 400,
                "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.": 400,
            };
            const status = statusMap[error.message] || 500;
            res.status(status).json({ message: error.message });
        }
    }

    /**
     * Handle customer connect request
     * @request - name, email, reason
     */
    async connectUser(req: Request, res: Response): Promise<Response> {
        try {
            const data = req.body as IUserMessage;
            await customerService.handleCustomerConnectRequest(data);
            return res.status(200).json({ message: "Customer connect request sent successfully" });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getReferrals(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new Error("User ID is required");
            const referrals = await CustomerReferralService.findUserWithReferral(userId);
            return res.status(200).json({ message: "Referrals retrieved successfully", data: referrals });
        } catch (error: any) {
            console.log("Failed to get referral details of user: ", error);
            if (
                error.message === "User ID is required" ||
                error.message === "User not found"
            ) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Failed to get referral details of user" });
        }
    }
}

export default new CustomerController();
