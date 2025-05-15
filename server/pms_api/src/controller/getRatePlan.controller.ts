import PropertyPrice from "../model/ratePlan.model";
import { Request, Response } from "express";

export const getRatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(id)
        
        const priceList = await PropertyPrice.find({ property_id: id });

        if (!priceList) {
            return res.status(401).json({
                success: false,
                message: "No price data found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Price list fetched successfully",
            priceList: priceList
        })
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error while fetching price, please try again later"
        })
    }
}