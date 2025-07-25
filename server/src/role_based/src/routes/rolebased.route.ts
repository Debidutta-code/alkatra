import { Router, Request, Response, NextFunction } from "express";
import { AdminServices } from "../services/admin.services"
import { protect } from "../../../user_authentication/src/Middleware/auth.middleware";

const AdminRoutes = Router();
AdminRoutes.get("/getHotelManagerRooms", protect as any, (req: Request, res: Response, next: NextFunction) => {
	return AdminServices.getHotelManagersHotel(req, res, next);
})

export default AdminRoutes;