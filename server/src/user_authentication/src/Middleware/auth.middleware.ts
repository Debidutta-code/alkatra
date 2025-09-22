import { NextFunction, Response } from "express";
import { catchAsync } from "../Utils/catchAsync";
import { decodeToken } from "../Utils/jwtHelper";
import { CustomRequest } from "../Utils/types";
import { ErrorMessages, formatError } from "../Error/errorMessages";

export const protect = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw formatError(ErrorMessages.NO_TOKEN_PROVIDED);
    }

    try {
      const decoded = await decodeToken(token, process.env.JWT_SECRET_KEY_DEV!);
      // console.log("decoded",decoded)
      if (!decoded || !decoded.id || !decoded.role || !decoded.email) {
        throw formatError(ErrorMessages.INVALID_TOKEN);
      }

      // req.jwt = token;
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };
      req.role = decoded.role;

      next();
    } catch (error) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        throw formatError(ErrorMessages.EXPIRED_TOKEN);
      }
      throw formatError(ErrorMessages.INVALID_TOKEN);
    }
  }
);

export const restrictTo =
  (...roles: Array<"superAdmin" | "groupManager" | "hotelManager">) =>
    (req: CustomRequest, res: Response, next: NextFunction) => {
      if (!req.role || !roles.includes(req.role as any)) {
        throw formatError(ErrorMessages.UNAUTHORIZED_ACTION);
      }
      next();
    };
