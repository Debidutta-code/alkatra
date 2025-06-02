import axios from 'axios';
import { modifiedRatePlanInterface } from '../types';
export const fetchRatePlans = async (hotelCode: string, accessToken: string, pageNo: number, invTypeCode?: string, startDate?: Date, endDate?: Date) => {
    try {
        const mapRatePlanResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/hotelCode?page=${pageNo}`, { hotelCode, invTypeCode, startDate, endDate }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        console.log(mapRatePlanResponse.data.data.data)
        return mapRatePlanResponse.data.data
    } catch (error: any) {
        return {
            success: false,
            message: error?.message
        }
    }

}

export const getAllRatePlans = async (accessToken: string) => {
    try {
        const ratePlans =  await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomType/all`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    return ratePlans.data
    } catch (error:any) {
        return {
            success:false,
            message:error.message
        }
    }
}

export const modifyRatePlans=async(ratePlans:modifiedRatePlanInterface[],accessToken:string)=>{
try {
    const modifiedRatePlanResponse=await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/updateRatePlans`,{ratePlans},{headers:{
        "Authorization":`Bearer ${accessToken}`
    }})
    return modifiedRatePlanResponse.data
} catch (error:any) {
    return {success:false,
        message:error.message
    }
}
}