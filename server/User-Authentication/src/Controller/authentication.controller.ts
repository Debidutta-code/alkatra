import { NextFunction, Response } from "express";
import { Request } from "express";
import { catchAsync } from "../Utils/catchAsync";
import { UserService } from "../Service/userAuthentication.service";

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await this.userService.registerUser(req.body);
    res.status(201).json({
      status: "success",
      error: "false",
      message: "User registered successfully",
      data: newUser,
    });
  });

  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const { user, accessToken } = await this.userService.loginUser({ email, password });
    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: false, secure: true })
      .json({
        status: "success",
        error: false,
        message: "User logged in successfully",
        data: { accessToken },
      });
  });

  logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken");
    res.status(200).json({
      status: "success",
      message: "User logged out successfully",
    });
  });

  verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await this.userService.verifyEmail(email);
    res.status(200).json({
      status: "success",
      message: "Email verified, proceed to reset password",
    });
  });

  updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const updatedUser = await this.userService.updateUserPassword(req.body);
    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  });
}
