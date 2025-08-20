import UserModel from "../../../user_authentication/src/Model/auth.model"
import { PropertyInfo } from "../../../property_management/src/model/property.info.model"
// import {ReservationLog} from "../../../wincloud/src/model/reservationModel"
// import { string } from "joi"

class AdminDao{
    public static async getHotelManagersHotel(id:string){
        try {
            const result=await UserModel.findOne({_id:id})
            return result
        } catch (error:any) {
            throw new Error(error.message)
        }
        
    }
    public static async getPropertyDetails(id:string){
                    const property = await PropertyInfo.findOne({ user_id: id }).select("property_name _id").lean()
                    return property
    }
    
}

export {AdminDao}
