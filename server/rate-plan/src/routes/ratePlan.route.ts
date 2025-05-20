import { Router, Request, Response, NextFunction } from "express";
import { RatePlanController } from "../controller/ratePlan.controller";
import { protect } from "../../../User-Authentication/src/Middleware/auth.middleware";

const route = Router();


route.put(
    "/update/:id",
    protect as any,
    async (req: Request, res: Response, next: NextFunction) => {
        const response = await RatePlanController.updateRatePlan(req, res, next);
        res.status(200).json(response);
    }
);

route.post(
  "/create",
   protect as any,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Inside route handler");
    const response = await RatePlanController.createRatePlan(req, res, next);
    res.status(200).json(response);
  }
);



export default route;