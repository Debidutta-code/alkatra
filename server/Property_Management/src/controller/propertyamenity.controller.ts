import { NextFunction, Response } from "express";
import { Request, catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { PropertyInfo } from "../model/property.info.model";
import { propertyAminity } from "../model/propertyamenite.model";

const updatePropertyAmenity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    const { destination_type, property_type, no_of_rooms_available, amenities } = req.body;

    if (!req.body) {
      return next(new AppError("Please provide all the required details", 400));
    }

    const propertyAmenity = await propertyAminity.findOne({ propertyInfo_id: propertyId });
    if (!propertyAmenity) {
      return next(new AppError("No property amenity found, please try again ...", 400));
    }

    const isEmpty = Object.keys(amenities).length === 0;
    const updateFields: any = {};
    if (destination_type !== "") updateFields.destination_type = destination_type;
    if (property_type !== "") updateFields.property_type = property_type;
    if (no_of_rooms_available !== null) updateFields.no_of_rooms_available = no_of_rooms_available;
    if (!isEmpty) updateFields.amenities = amenities;

    const updatedAmenity = await propertyAminity.findByIdAndUpdate(
      propertyAmenity._id,
      {
        $set: updateFields
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      error: false,
      message: "Property amenity updated successfully",
      data: updatedAmenity,
    });
  }
);

const createAminity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      propertyInfo_id,
      destination_type,
      property_type,
      no_of_rooms_available,
      amenities,
    } = req.body;

    if (!req.body) {
      next(new AppError("Please fill all the required fields", 400));
    }

    const newAminity = await propertyAminity.create({
      propertyInfo_id,
      destination_type,
      property_type,
      no_of_rooms_available,
      amenities,
    });

    const property = await PropertyInfo.findByIdAndUpdate(propertyInfo_id, {
      property_amenities: newAminity._id,
    });

    res.status(201).json({
      status: "success",
      error: false,
      message: " successfully",
      data: newAminity,
    });
  }
);

export { updatePropertyAmenity, createAminity };
