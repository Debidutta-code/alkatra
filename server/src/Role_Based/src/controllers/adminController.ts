import { AdminDao } from "../dao/adminDao"
class AdminController {
    public static async getHotelManagersHotel(req: any) {
        try {

            const userId = req.user.id
            if (req.role != "hotelManager") {
                return {
                    success: false,
                    message: "Only Hotel Managers are allowed"
                }
            }
            if (!userId) {
                return {
                    success: false,
                    message: "User id Not found"
                }
            }
            const response = await AdminDao.getHotelManagersHotel(userId);
            if (!response) {
                return {
                    success: false,
                    message: "No User found"
                }
            }
            const property=await AdminDao.getPropertyDetails(userId)
            if(!property){
                return {
                    success:true,
                    message:"No Property found"
                }
            }
            return {
                success: true,
                message: "HotelInfo Retrieved Successfully",
                data: property
            }
        } catch (error: any) {
            return {
                success: false,
                message: error?.message
            }
        }

    }
}
export { AdminController }