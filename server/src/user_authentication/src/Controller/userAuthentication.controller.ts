import { Response, NextFunction } from "express";
import { UserService } from "../Service/userAuthentication.service";
import { ErrorFormat } from "../Error/errorMessages";
import { CustomRequest } from "../Utils/types";
import { catchAsync } from "../Utils/catchAsync";
import {PropertyInfo,PropertyInfoType} from "../../../property_management/src/model/property.info.model"

interface UpdateBody {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "superAdmin" | "groupManager" | "hotelManager";
}

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }
  getMe = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      // console.log("userid",userId)
      try {
        const user = await this.userService.getUserById(userId);
        const availableProperties=await PropertyInfo.find({user_id:userId})
        
        // Create a user object without sensitive data
        const userData = {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          contact: user.contact,
          createdBy: user.createdBy,
          noOfProperties:availableProperties.length
        };

        res.status(200).json({
          status: "success",
          error: false,
          message: "User fetched successfully",
          data: { user: userData },
        });
      } catch (error:any) {
        console.log(error.message)
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );
  updateProfile = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const requestingUserId = req.user?.id;
      const requestingUserRole = req.role as string;
      const { id, firstName, lastName, email, role } = req.body as UpdateBody;
      try {
        const updatedUser = await this.userService.updateUserProfile(
          id,
          requestingUserId || "",
          requestingUserRole,
          {
            firstName,
            lastName,
            email,
            role: role as "superAdmin" | "groupManager" | "hotelManager",
          }
        );

        // Create a user object without sensitive data
        const userData = {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          contact: updatedUser.contact,
          createdBy: updatedUser.createdBy,
        };

        res.status(200).json({
          status: "success",
          error: false,
          message: "User profile updated successfully",
          data: { user: userData },
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );
  getAllUsers = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const requestingUserRole = req.role as
        | "superAdmin"
        | "groupManager"
        | "hotelManager";
      const requestingUserEmail = req.user?.email;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      try {
        const { users, total, totalPages } = await this.userService.getAllUsers(
          page,
          limit,
          requestingUserRole,
          requestingUserEmail
        );

        // Filter out sensitive information from users
        const safeUsers = users.map((user) => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          contact: user.contact,
          createdBy: user.createdBy,
        }));

        res.status(200).json({
          status: "success",
          error: false,
          message: "Users fetched successfully",
          pagination: { total, page, totalPages, limit },
          data: { users: safeUsers },
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );
  deleteUser = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const userId = req.params.id;

      try {
        await this.userService.deleteUser(userId);

        res.status(200).json({
          status: "success",
          error: false,
          message: "User deleted successfully",
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );
  getUserById = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const userId = req.params.id;

      try {
        const user = await this.userService.getUserById(userId);

        // Create a user object without sensitive data
        const userData = {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          contact: user.contact,
          createdBy: user.createdBy,
        };

        res.status(200).json({
          status: "success",
          error: false,
          message: "User fetched successfully",
          data: { user: userData },
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );
  updateUserById = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const requestingUserId = req.user?.id;
      const requestingUserRole = req.role as string;
      const userId = req.params.id;
      const { firstName, lastName, email, role,password } = req.body;

      try {
        const updatedUser = await this.userService.updateUserProfile(
          userId,
          requestingUserId || "",
          requestingUserRole,
          {
            firstName,
            lastName,
            email,
            role: role as "superAdmin" | "groupManager" | "hotelManager",
            password
          }
        );

        // Create a user object without sensitive data
        const userData = {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          contact: updatedUser.contact,
          createdBy: updatedUser.createdBy,
        };

        res.status(200).json({
          status: "success",
          error: false,
          message: "User updated successfully",
          data: { user: userData },
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );
}
