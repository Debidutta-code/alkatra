import { Request, Response,NextFunction } from "express";
import { AdminController } from "../controllers/adminController"
class AdminServices {
    public static async getHotelManagersHotel(req: Request, res: any, next: NextFunction) {
        try {
            
            const response = await AdminController.getHotelManagersHotel(req)
            console.log(response)
            return res.status(200).json(response)
        } catch (error:any) {
            console.log(error?.message)
        }

    }
}
export { AdminServices }