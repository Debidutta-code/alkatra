import axios from 'axios';
import { modifiedRatePlanInterface } from '../types';

export const fetchRatePlans = async (
    hotelCode: string,
    accessToken: string,
    pageNo: number,
    invTypeCode?: string,
    startDate?: Date,
    endDate?: Date,
    ratePlanCode?: string,
    limit: number = 10
) => {
    try {
        const queryParams = new URLSearchParams({
            page: pageNo.toString(),
            limit: limit.toString()
        });

        if (invTypeCode) {
            queryParams.append('invTypeCode', invTypeCode);
        }

        if (ratePlanCode) {
            queryParams.append('ratePlanCode', ratePlanCode);
        }

        if (startDate) {
            const localStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
            queryParams.append('startDate', localStartDate);
        }

        if (endDate) {
            const localEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
            queryParams.append('endDate', localEndDate);
        }

        const mapRatePlanResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/hotelCode?${queryParams.toString()}`,
            { hotelCode },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        console.log(mapRatePlanResponse.data.data.data);
        return mapRatePlanResponse.data.data;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message
        };
    }
};

export const getAllRatePlans = async (accessToken: string, hotelCode: string) => {
    console.log(`The access token is ${accessToken}\nThe hotel code is ${hotelCode}`);
    try {
        const ratePlans = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomType/all?hotelCode=${hotelCode}`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );
        return ratePlans.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        };
    }
};

export const modifyRatePlans = async (ratePlans: modifiedRatePlanInterface[], accessToken: string) => {
    try {
        const modifiedRatePlanResponse = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/updateRatePlans`,
            { ratePlans },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );
        return modifiedRatePlanResponse.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        };
    }
};

export const updateSellStatus = async (
    payload: {
        hotelCode: string;
        invTypeCode: string[];
        dateStatusList: { date: string; status: 'open' | 'close' }[];
    },
    accessToken: string
) => {
    try {
        const response = await axios.patch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/updateStatus`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update sell status');
    }
};