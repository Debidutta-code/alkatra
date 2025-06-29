import { Express, NextFunction, Request, Response } from "express";
import { AppError } from "../Property_Management/src/utils/appError";
import { errorHandler } from "../Property_Management/src/middlewares/error.middleware";

// route imports
import roleBased from "../RoleBased/src/routes/rolebased.route"
import authRouter from "../User-Authentication/src/Routes/auth.route";
import pmsRoutes from "../Property_Management/src/api";
import userRouter from "../User-Authentication/src/Routes/user.route";
import searchRouter from "../search-engine/src/routes/search";
import inventoryRouter from "../wincloud/src/api/route";
import customerRouter from "../Customer-Authentication/src/api/routes/customerRoutes";
import bookingRouter from "../Booking_Engine/src/routes/booking.routes";
import paymentRouter from "../Booking_Engine/src/routes/payment.routes";
import cryptoRouter from "../Booking_Engine/src/routes/cryptoPayment.routes";
import ratePlaneRoute from "../rate-plan/src/routes/ratePlan.route";
import couponManagement from "../Coupon_Management/routes/couponRoutes";
import notification from "../notification/src/route/notification.route";
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

  app.use("/api/v1/booking", bookingRouter);
  app.use("/api/v1/payment", paymentRouter);
  
  // crypto payment routes
  app.use("/api/v1/crypto", cryptoRouter);

  app.use("/api/v1/rate-plan", ratePlaneRoute);

  // Coupon managemen api
  app.use("/api/v1/coupon", couponManagement);
  app.use("/api/v1/admin", roleBased)
  app.use("/api/v1/notification", notification);


  app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
  });

  app.use(errorHandler);
}
