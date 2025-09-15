import { Router, Request, Response, NextFunction } from "express";
import { RatePlanController, RoomPrice, StartStopWatcher } from "../controller/ratePlan.controller";
import { protect } from "../../../user_authentication/src/Middleware/auth.middleware";
import { InventoryService } from "../service/inventory.service";

const route = Router();

const inventoryService = InventoryService.getInstance();
const startStopWatcher = new StartStopWatcher(inventoryService);


route.put(
  "/updateRatePlans",
  protect as any,
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await RatePlanController.updateRatePlan(req, res, next);
    res.status(200).json(response);
  }
);

route.get(
  "/:hotelCode",
  protect as any,
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await RatePlanController.getRatePlanByHotelCode(req, res, next);
    res.status(200).json(response);
  }
)
route.post(
  "/create",
  protect as any,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Inside route handler");
    const response = await RatePlanController.createRatePlan(req, res, next);
    res.status(200).json(response);
  }
);

route.post(
  "/hotelCode",
  protect as any,
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await RatePlanController.getRatePlanByHotel(req, res, next);
    res.status(200).json(response);
  }
)

route.get("/hotelRoomPrice", async (req: Request, res: Response, next: NextFunction) => {
  const response = await RoomPrice.getRoomPriceByHotelCode(req, res, next)
  res.status(200).json(response)
})
route.post("/getRoomRentPrice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await RoomPrice.getRoomRentController(req, res, next)
    res.status(200).json(response)
  } catch (error: any) {
    console.error("Error in getRoomRentPrice route:", error);
    res.status(500).json({ message: error.message });
  }
})

route.get("/getRoomType/all", protect, async (req: Request, res: Response, next: NextFunction) => {
  const response = await RoomPrice.getAllRoomTypeController(req)
  res.status(200).json(response)
})
route.post("/checkAvailability", async (req: Request, res: Response, next: NextFunction) => {
  const response = await RoomPrice.checkAvailabilityController(req, res, next)
  res.status(200).json(response)
})

route.patch("/updateStatus", async (req: Request, res: Response, next: NextFunction) => {
  await startStopWatcher.updateStartStopSell.bind(startStopWatcher)(req, res, next);
});

export default route;