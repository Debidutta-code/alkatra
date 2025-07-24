// import { AppError, Request, catchAsync } from "../index";
import { NextFunction, Response } from "express";
import { Request, catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { decodeToken } from "../utils/jwtHelper";
import User from "../model/user.model";

export const protect = catchAsync(
  async (req: Request<unknown, unknown>, res: Response, next: NextFunction) => {
    let token;
    console.log("console.log 1");
    console.log(req.headers.authorization)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You'r not logged in, please login to continue", 401)
      );
    }

    req.jwt = token;

    const decoded = await decodeToken(token, process.env.JWT_SECRET_KEY_DEV!);
    console.log("decoded From Pms Api", decoded);
    const user = await User.findById(decoded?.id);
    console.log("user From PmsApi", user);
    // const manager = await managerService.getManagerById(decoded?.id);

    req.user = decoded?.id;
    req.role = decoded?.role;

    next();
  }
);
