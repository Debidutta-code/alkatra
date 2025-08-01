import { Request, Response } from "express";
import AnalyticsController from "../controllers/analytics.controller";

export default class Analytics {
  public static async getAnalytics(req: Request, res: Response) {
    try {
      const response = await AnalyticsController.getAnalytics(req);
      const statusCode = response.success ? 200 : 400;
      return res.status(statusCode).json(response);
    } catch (error) {
      console.error("Error in Analytics service:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error in analytics service",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}