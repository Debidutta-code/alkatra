import { Request, Response } from "express";
import { ICustomer } from "../models";
import { AuthenticatedRequest } from "../interfaces/common.interface";


/**
 * Interface for Google OAuth authentication data.
 */
export interface IGoogleAuthData {
    code?: string;
    token?: string;
    provider: string; // 'local' | 'google'
}

/**
 * Interface for Google user data returned after authentication.
 */
export interface IGoogleUserData {
    token: string;
    user: Partial<any>;    
}


/**
 * Interface for Google OAuth authentication service.
 */
export interface IGoogleAuthService {

    /**
     * Authenticate a user using Google OAuth.
     */
    authenticate(data: IGoogleAuthData): Promise<IGoogleUserData>;

} 


/**
 * Interface for Google OAuth authentication controller.
 */
export interface IGoogleAuthController {
    
    /**
     * Handle Google OAuth authentication requests.
     */
    authenticate(req: Request, res: Response): Promise<Response>;

    /**
     * Retrieve user information based on the provided JWT token.
     */
    getUser(req: AuthenticatedRequest, res: Response): Promise<Response>;
    
}