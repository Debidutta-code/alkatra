import { Request, Response } from "express";
import { ICustomer } from "../models";
import { AuthenticatedRequest } from "./common.interface";

/**
 * Interface for Apple OAuth authentication data.
 */
export interface IAppleAuthData {
    identityToken?: string;
    authorizationCode?: string;
    provider: string; // 'apple'
    firstName?: string;
    lastName?: string;
    nonce?: string; // <-- ADD THIS
}

/**
 * Interface for Apple user data returned after authentication.
 */
export interface IAppleUserData {
    token: string;
    user: Partial<ICustomer>;    
}

/**
 * Interface for Apple OAuth authentication service.
 */
export interface IAppleAuthService {
    /**
     * Authenticate a user using Apple Sign-In.
     */
    authenticate(data: IAppleAuthData): Promise<IAppleUserData>;
}

/**
 * Interface for Apple OAuth authentication controller.
 */
export interface IAppleAuthController {
    /**
     * Handle Apple Sign-In authentication requests.
     */
    authenticate(req: Request, res: Response): Promise<Response>;

    /**
     * Retrieve user information based on the provided JWT token.
     */
    getUser(req: AuthenticatedRequest, res: Response): Promise<Response>;
}

/**
 * Interface for Google OAuth authentication data.
 */
export interface IGoogleAuthData {
    accessToken?: string;
    idToken?: string;
    provider: string; // 'google'
    firstName?: string;
    lastName?: string;
}

/**
 * Interface for Google user data returned after authentication.
 */
export interface IGoogleUserData {
    token: string;
    user: Partial<ICustomer>;    
}

/**
 * Interface for Google OAuth authentication service.
 */
export interface IGoogleAuthService {
    /**
     * Authenticate a user using Google Sign-In.
     */
    authenticate(data: IGoogleAuthData): Promise<IGoogleUserData>;
}

/**
 * Interface for Google OAuth authentication controller.
 */
export interface IGoogleAuthController {
    /**
     * Handle Google Sign-In authentication requests.
     */
    authenticate(req: Request, res: Response): Promise<Response>;

    /**
     * Retrieve user information based on the provided JWT token.
     */
    getUser(req: AuthenticatedRequest, res: Response): Promise<Response>;
}

// Re-export common interface
export { AuthenticatedRequest } from './common.interface';