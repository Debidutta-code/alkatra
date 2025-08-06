import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest =
    (schema: ZodType<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next();
            } catch (error: any) {
                /**
                 * Handle proper error response
                 */
                console.error("Failed to validate request at Middleware Layer:", error);
                return res.status(400).json({
                    success: false,
                    message: "Invalid request parameters",
                    errors: error.errors,
                });
            }
        };
