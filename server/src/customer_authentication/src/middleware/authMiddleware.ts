import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/custom";

export const authenticateCustomer = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(`The token we get ${token}`);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "your-secret-key") as { id: string };
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
