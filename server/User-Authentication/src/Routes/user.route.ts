import { Router, Response, RequestHandler } from "express";
import { protect, restrictTo } from "../Middleware/auth.middleware";
import { UserController } from "../Controller/userAuthentication.controller";
import { CustomRequest } from "../Utils/types";
import { AuthController } from "../Controller/authentication.controller";

const router = Router();
const userController = new UserController();
const authController = new AuthController();

// Type assertions to help TypeScript understand our middleware chain
router
  .route("/")
  .get(
    protect as RequestHandler,
    restrictTo("groupManager", "superAdmin") as RequestHandler,
    userController.getAllUsers as RequestHandler
  );

router
  .route("/me")
  .get(protect as RequestHandler, userController.getMe as RequestHandler);

// Add route to get user by ID
router
  .route("/:id")
  .get(
    protect as RequestHandler,
    restrictTo("superAdmin", "groupManager") as RequestHandler,
    userController.getUserById as RequestHandler
  );

router
  .route("/update")
  .put(
    protect as RequestHandler,
    userController.updateProfile as RequestHandler
  );

// Add route to update user by ID
router
  .route("/update/:id")
  .put(
    protect as RequestHandler,
    restrictTo("superAdmin", "groupManager") as RequestHandler,
    userController.updateUserById as RequestHandler
  );

// Delete user endpoint with role-based restrictions
router
  .route("/delete/:id")
  .delete(
    protect as RequestHandler,
    restrictTo("superAdmin", "groupManager") as RequestHandler,
    userController.deleteUser as RequestHandler
  );

// // Create user endpoint with role-based restrictions
// router
//   .route("/create-user")
//   .post(
//     protect as RequestHandler,
//     restrictTo("superAdmin", "groupManager") as RequestHandler,
//     authController.createUser as RequestHandler
//   );

// Role-specific test endpoints with route handler cast to RequestHandler
router.route("/superadmin-only").get(
  protect as RequestHandler,
  restrictTo("superAdmin") as RequestHandler,
  ((req: CustomRequest, res: Response) => {
    res.status(200).json({
      status: "success",
      message: "You have superAdmin access",
      data: { user: req.user, role: req.role },
    });
  }) as RequestHandler
);

router.route("/manager-only").get(
  protect as RequestHandler,
  restrictTo("superAdmin", "groupManager") as RequestHandler,
  ((req: CustomRequest, res: Response) => {
    res.status(200).json({
      status: "success",
      message: "You have management access",
      data: { user: req.user, role: req.role },
    });
  }) as RequestHandler
);

export default router;
