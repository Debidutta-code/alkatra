import { Router, Request, Response, NextFunction } from "express";
import Analytics from "../services/analytics.services";
import { protect } from "../../../user_authentication/src/Middleware/auth.middleware";

const analytics = Router();

analytics.get(
  "/getAnalytics",
  protect as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Analytics.getAnalytics(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default analytics;