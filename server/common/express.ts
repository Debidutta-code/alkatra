import { Express, NextFunction, Request, Response } from "express";
import { AppError } from "../pms_api/src/utils/appError";
import { errorHandler } from "../pms_api/src/middlewares/error.middleware";

// route imports
import authRouter from "../User-Authentication/src/Routes/auth.route";
import pmsRoutes from "../pms_api/src/api";
import userRouter from "../User-Authentication/src/Routes/user.route";
import searchRouter from "../search-engine/src/routes/search";
import inventoryRouter from "../wincloud/src/api/route";
import customerRouter from "../Customer-Authentication/src/api/routes/customerRoutes";

export async function initializeExpressRoutes({ app }: { app: Express }) {
  app.head("/status", (_, res: Response) => res.status(200).end());

  // Authentication
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/customers", customerRouter);
  // PMS
  app.use("/api/v1/pms", pmsRoutes());
  app.use("/api/v1/search", searchRouter);
  // amadeus hotel routes
  app.use("/api/v1/room", inventoryRouter);

  app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
  });

  app.use(errorHandler);
}
