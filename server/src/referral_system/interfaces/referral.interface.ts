import { IReferral } from "../models";
import { Request, Response } from "express";

export interface IGenerateReferralLinkAndQR {
    message?: string;
    referrerId: string;
    referral_link: string;
    referral_qr_code: string;
}

export interface IReferralData {
    referrerId: string;
    refereeId: string;
    referralCode: string;
    referralLink: string;
    referralQRCode: string;
}

export interface IGenerateReferralPayload {
    referralCode: string;
    referralLink: string;
    referralQRCode: string;
}

export interface IReferralRequest {
    referrerId: string;
    skip: number;
    limit: number;
}

export interface IReferralResponse {
    // data: IReferral[];
    data: any;
    total: number;
    page: number;
    limit: number;
}

export interface IReferralRepository {
    /**
     * Creates and saves a new referral document to the database.
     */
    createReferral(referral: Partial<IReferral>): Promise<IReferral>;

    /**
     * Finds a referral record based on both referrer and referee IDs. 
     */
    findByReferrerAndReferee(referrerId: string, refereeId: string): Promise<IReferral | null>;

    /**
     * Retrieves all referrals made by a specific referrer, sorted by creation date (newest first).
     */
    findByReferrerId(payload: IReferralRequest): Promise<IReferralResponse>;

    /**
     * Finds a referral record where the specified user is the referee.
     */
    findByRefereeId(refereeId: string): Promise<IReferral | null>;

    /**
     * Updates the referral status (e.g., from "pending" to "completed") using the referral ID.
     */
    // updateStatus(id: string, status: "pending" | "completed"): Promise<IReferral | null>;
}



export interface IReferralService {
    /**
     * Generates a unique referral code for a user.
     */
    generateReferralLinkAndQR(userId: string): Promise<IGenerateReferralLinkAndQR>;

    /**
     * Applies a referral code to a user and creates a new referral document in the database.
     */
    applyReferral(referralData: IReferralData): Promise<IReferral>;

    /**
     * Retrieves all referrals made by a specific referrer, sorted by creation date (newest first).
     */
    getReferralsByReferrer(payload: IReferralRequest): Promise<IReferralResponse>;

    /**
     * Finds a referral record where the specified user is the referee.
     */
    getReferralByReferee(refereeId: string): Promise<IReferral | null>;

    /**
     * Updates the referral status (e.g., from "pending" to "completed") using the referral ID.
     */
    // updateReferralStatus(id: string, status: "pending" | "completed"): Promise<IReferral | null>;
}


export interface IReferralController {
    /**
     * Generates a referral code for a user and sends it in the response.
     */
    generateReferral(req: Request, res: Response): Promise<Response<IGenerateReferralLinkAndQR> | void>;

    /**
     * Applies a referral code to a user and creates a new referral document in the database.
     */
    applyReferralCode(req: Request, res: Response): Promise<Response<IReferral> | void>;

    /**
     * Retrieves all referrals made by a specific referrer and sends them in the response.
     */
    getReferralsByReferrer(req: Request, res: Response): Promise<Response<IReferral> | void>;

    /**
     * Retrieves a referral record where the specified user is the referee and sends it in the response.
     */
    getReferralByReferee(req: Request, res: Response): Promise<Response<IReferral> | void>;

    /**
     * Updates the status of a referral and sends the updated referral in the response.
     */
    // updateReferralStatus(req: Request, res: Response): Promise<Response<IReferral> | void>;
}