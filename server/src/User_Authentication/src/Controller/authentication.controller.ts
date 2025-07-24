import { NextFunction, Response } from "express";
import { Request } from "express";
import { catchAsync } from "../Utils/catchAsync";
import { UserService } from "../Service/userAuthentication.service";

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }
  register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Set role to superAdmin by default for /register endpoint
      const userData = {
        ...req.body,
        role: req.body.role || "superAdmin", // Default to superAdmin for /register endpoint
      };

      const newUser = await this.userService.registerUser(userData);

      // Create a user object without the password
      const userResponse = {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        contact: newUser.contact,
        createdBy: newUser.createdBy,
      };

      res.status(201).json({
        status: "success",
        error: "false",
        message: "User registered successfully",
        data: userResponse,
      });
    }
  );
  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      const { user, accessToken } = await this.userService.loginUser({
        email,
        password,
      });

      // Create a user object without sensitive data
      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        contact: user.contact,
      };

      res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: false, secure: true })
        .json({
          status: "success",
          error: false,
          message: "User logged in successfully",
          data: {
            accessToken,
            user: userData,
          },
        });
    }
  );

  logout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.clearCookie("accessToken");
      res.status(200).json({
        status: "success",
        message: "User logged out successfully",
      });
    }
  );

  verifyEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      await this.userService.verifyEmail(email);
      res.status(200).json({
        status: "success",
        message: "Email verified, proceed to reset password",
      });
    }
  );

  updatePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const updatedUser = await this.userService.updateUserPassword(req.body);
      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    }
  );
  createUser = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      // Get the creator's email from the JWT token
      const creatorEmail = req.user?.email;

      // Check if creator role is allowed to create the requested role
      const creatorRole = req.role;
      const requestedRole = req.body.role;

      // Validate role creation permissions
      if (creatorRole === "groupManager" && requestedRole === "groupManager") {
        return res.status(403).json({
          status: "error",
          message: "Group managers cannot create other group managers",
        });
      }

      // Only allow creating users with hotelManager or groupManager roles
      const userData = {
        ...req.body,
        role:
          req.body.role &&
          ["hotelManager", "groupManager"].includes(req.body.role)
            ? req.body.role
            : "hotelManager", // Default to hotelManager if no valid role provided
        createdBy: creatorEmail, // Add the creator's email
      };
      const newUser = await this.userService.registerUser(userData);

      // Create a user object without the password
      const userResponse = {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        contact: newUser.contact,
        createdBy: newUser.createdBy,
      };

      // When PropertyInfo is created elsewhere in the system, it should receive only the user ID
      // This ensures proper ObjectId casting when saving to the PropertyInfo model
      res.status(201).json({
        status: "success",
        error: false,
        message: "User created successfully",
        data: userResponse,
      });
    }
  );
}
