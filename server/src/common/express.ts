import { Express, NextFunction, Request, Response } from "express";
import { AppError } from "../property_management/src/utils/appError";
import { errorHandler } from "../property_management/src/middlewares/error.middleware";

// route imports
import roleBased from "../role_based/src/routes/rolebased.route"
import authRouter from "../user_authentication/src/Routes/auth.route";
import pmsRoutes from "../property_management/src/api";
import userRouter from "../user_authentication/src/Routes/user.route";
import inventoryRouter from "../wincloud/src/api/route";
import customerRouter from "../customer_authentication/src/api/routes/customerRoutes";
import bookingRouter from "../booking_engine/src/routes/booking.routes";
import paymentRouter from "../booking_engine/src/routes/payment.routes";
import cryptoRouter from "../booking_engine/src/routes/cryptoPayment.routes";
import ratePlaneRoute from "../rate_plan/src/routes/ratePlan.route";
import couponManagement from "../coupon_management/routes/couponRoutes";
import notification from "../notification/src/route/notification.route";
import googleAuth from "../customer_authentication/src/api/routes/googleAuthRoute";
import analytics from "../role_based/src/routes/analytics.route";

// Referral system routes
import { ReferralRouter } from "../referral_system/routes";

// Tax service routes
import { TaxRuleRouter, TaxGroupRouter } from "../tax_service/routes";

export async function initializeExpressRoutes({ app }: { app: Express }) {
  app.head("/status", (_, res: Response) => res.status(200).end());

  // Authentication
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/customers", customerRouter);

  // Google Auth
  app.use("/api/v1/google", googleAuth);
  // PMS
  app.use("/api/v1/pms", pmsRoutes());
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
  app.use("/api/v1/analytics", analytics);

  // Referral system routes
  app.use("/api/v1/referrals", ReferralRouter);

  // Tax Service routes
  app.use("/api/v1/tax-rule", TaxRuleRouter);
  app.use("/api/v1/tax-group", TaxGroupRouter);


  app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
  });

  app.use(errorHandler);
}
