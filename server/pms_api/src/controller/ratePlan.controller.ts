import { NextFunction, Response } from "express";
import { catchAsync, Request } from "../utils/catchAsync";
import { PropertyInfo } from "../model/property.info.model";
import PropertyPrice from "../model/ratePlan.model";
import { Room } from "../model/room.model";
import { AppError } from "../utils/appError";
import RateType from "../model/rateType.model";
import RatePlanType from "../model/rateType.model";

export const createRoomRatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { propertyId } = req.params;

        const {
            rate_plan_name,
            description,
            meal_plan,
            max_occupancy,
            adult_occupancy,
            min_length_stay,
            max_length_stay,
            min_book_advance,
            max_book_advance,
            status,
            scheduling
        } = req.body;

        if (!propertyId || !rate_plan_name || !meal_plan || !scheduling) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Find matching rate_plan_code from rate plan type DB
        const matchedRatePlan = await RatePlanType.findOne({ name: rate_plan_name });
        if (!matchedRatePlan) {
            return res.status(404).json({ success: false, message: "Invalid rate_plan_name" });
        }

        const rate_plan_code = matchedRatePlan.code;

        // Create rate plan
        const newRatePlan = await RatePlanType.create({
            propertyId,
            rate_plan_code,
            rate_plan_name,
            description,
            meal_plan,
            max_occupancy,
            adult_occupancy,
            min_length_stay,
            max_length_stay,
            min_book_advance,
            max_book_advance,
            status,
            scheduling,
            created_by: new Date(),
            updated_by: new Date()
        });

        // Optional: update property and room if needed
        await PropertyInfo.findByIdAndUpdate(propertyId, {
            $addToSet: { rate_plans: newRatePlan._id }
        });

        return res.status(201).json({
            success: true,
            message: "Rate plan created successfully",
            data: newRatePlan
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateRoomRatePlan = async (req: Request, res: Response) => {
    try {
        const rateplanId = req.params.id; // Assuming the rate plan ID is passed in the URL
        console.log(`Updating Rate Plan with ID: ${rateplanId}`);

        const {
            meal_plan,
            room_price,
            rate_plan_name,
            rate_plan_description,
            min_length_stay,
            max_length_stay,
            min_book_advance,
            max_book_advance
        } = req.body;

        console.log("==== Incoming Update Rate Plan Data ====");
        console.log("Params:", req.params);
        console.log("Body:", req.body);

        // Find and update the rate plan by its ID
        const updatedRatePlan = await PropertyPrice.findByIdAndUpdate(
            rateplanId,
            {
                $set: {
                    meal_plan,
                    room_price,
                    rate_plan_name,
                    rate_plan_description,
                    min_length_stay,
                    max_length_stay,
                    min_book_advance,
                    max_book_advance
                }
            },
            { new: true, runValidators: true } // Ensure the updated document is returned and validators are run
        );

        if (!updatedRatePlan) {
            return res.status(404).json({ success: false, message: "No rate plan found with the provided ID" });
        }

        return res.status(200).json({
            success: true,
            message: "Rate plan updated successfully",
            updatedRatePlan: updatedRatePlan
        });
    } catch (error) {
        console.error("Error updating rate plan:", error);
        return res.status(500).json({
            success: false,
            message: "Internal error while updating rate plan, please try again later"
        });
    }
};

export const getRoomRatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;  // room_id
        if (!id) {
            return res.status(401).json({ success: false, message: "Room ID is required" })
        }
        const ratePlanList = await PropertyPrice.find({ applicable_room_type: id });
        if (!ratePlanList) {
            return res.status(401).json({ success: false, message: "No rateplan found for this room" })
        }
        return res.status(200).json({
            success: true,
            message: "Price list fetched successfully",
            totalRatePlan: ratePlanList.length,
            ratePlanList: ratePlanList
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

export const deleteRoomRatePlan = async (req: Request, res: Response) => {
    try {
        // as multiple rateplans can be associated with the same room so we need to update specific rateplan only using it _id.
        const { id } = req.params;  // rate plan id
        if (!id) {
            return res.status(401).json({ success: false, message: "Rate plan ID is required" })
        }
        const ratePlan = await PropertyPrice.findByIdAndDelete({ _id: id });
        if (!ratePlan) {
            return res.status(401).json({ success: false, message: "No rateplan found with this id" })
        }
        return res.status(200).json({
            success: true,
            message: "Rateplan deleted successfully",
            deletedRatePlan: ratePlan
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error while deleting price, please try again later"
        })
    }
}

export const getAllRatePlans = async (req: Request, res: Response) => {
    try {
        const property_id = req.params.id;
        console.log("property_id: ", property_id)
        if (!property_id) {
            return res.status(401).json({ success: false, message: "Property ID is required" })
        }

        const ratePlanList = await PropertyPrice.find({ property_id: property_id });
        if (!ratePlanList) {
            return res.status(401).json({ success: false, message: "No rateplan found for this property" })
        }

        return res.status(200).json({
            success: true,
            message: "Price list fetched successfully",
            totalRatePlan: ratePlanList.length,
            ratePlanList: ratePlanList
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error while deleting price, please try again later"
        })
    }
}

export const createRateType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { code, name, description } = req.body;
    if (!code || !name) {
        return next(new AppError('Rate type code and name are required.', 400));
    }
    const existing = await RatePlanType.findOne({ code: code.toUpperCase() });
    if (existing) {
        return next(new AppError('Rate type code already exists.', 409));
    }
    const newRateType = await RatePlanType.create({
        code: code.toUpperCase(),
        name,
        description,
    });
    res.status(201).json({
        status: 'success',
        message: 'Rate type created successfully',
        data: newRateType,
    });
});

export const getRateTypes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const rateTypes = await RatePlanType.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
        status: 'success',
        results: rateTypes.length,
        data: rateTypes,
    });
});