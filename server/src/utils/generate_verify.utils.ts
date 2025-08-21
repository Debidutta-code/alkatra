import jwt from "jsonwebtoken";
import { config } from "../config";

const { secretKey, expiresIn } = config.server.jwt;


export class GenerateVerifyUtils {
    static generateToken(payload: object): string {
        return jwt.sign(payload, secretKey, { expiresIn });
    }

    static verifyToken(token: string) {
        try {
            return jwt.verify(token, secretKey);
        } catch (error) {
            console.error("Token verification failed:", error);
            return null;
        }
    }
}