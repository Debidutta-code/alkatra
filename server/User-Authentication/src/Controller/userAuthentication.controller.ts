import { Response, NextFunction } from "express";
import { UserService } from "../Service/userAuthentication.service";
import { ErrorFormat } from "../Error/errorMessages";
import { CustomRequest } from "../Utils/types";
import { catchAsync } from "../Utils/catchAsync";

interface UpdateBody {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getMe = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const userId = req.user as string;
      try {
        const user = await this.userService.getUserById(userId);
        res.status(200).json({
          status: "success",
          error: false,
          message: "User fetched successfully",
          data: { user },
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );

  updateProfile = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const requestingUserId = req.user as string;
      const requestingUserRole = req.role as string;
      const { id, firstName, lastName, email, role } = req.body as UpdateBody;
      try {
        const updatedUser = await this.userService.updateUserProfile(
          id,
          requestingUserId,
          requestingUserRole,
          { firstName, lastName, email, role }
        );
        res.status(200).json({
          status: "success",
          error: false,
          message: "User profile updated successfully",
          data: { user: updatedUser },
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );

  getAllUsers = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const requestingUserRole = req.role as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      try {
        const { users, total, totalPages} = await this.userService.getAllUsers(
          page,
          limit,
          requestingUserRole
        );
        res.status(200).json({
          status: "success",
          error: false,
          message: "Users fetched successfully",
          pagination: { total, page, totalPages, limit },
          data: { users },
        });
      } catch (error) {
        const err = error as ErrorFormat;
        res.status(err.errors[0].status).json(err);
      }
    }
  );
}