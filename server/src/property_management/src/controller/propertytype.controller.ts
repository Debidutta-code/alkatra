import { NextFunction, Response } from "express";
import { Request, catchAsync } from "../utils/catchAsync";
import { Role } from "../utils/jwtHelper";
import { AppError } from "../utils/appError";
import PropertyType from "../model/propertytype.model";
import PropertyCategory from "../model/propertycategory.model";
import mongoose from "mongoose";

const createPropertyType = catchAsync(
  async (req: Request<{}, Role>, res: Response, next: NextFunction) => {
    if (req.role !== "superadmin") {
      return next(
        new AppError("You're not authorized to perform this operation", 401)
      );
    }

    const { propertyCategory, name, code, typeCategory } = req.body;

    if (!propertyCategory || !name || !code) {
      return next(
        new AppError("Please provide all required fields: propertyCategory, name, code", 400)
      );
    }

    // Verify property category exists
    const category = await PropertyCategory.findById(propertyCategory);
    if (!category) {
      return next(new AppError("Property category not found", 404));
    }

    const newPropertyType = new PropertyType({
      propertyCategory,
      name,
      code,
      typeCategory: typeCategory || "Most common",
    });

    await newPropertyType.save();

    res.status(201).json({
      status: "success",
      error: false,
      message: "Property type created successfully",
      data: {
        propertyType: newPropertyType,
      },
    });
  }
);

const getPropertyTypes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId, typeCategory } = req.query;

    const filter: any = {};

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId as string)) {
        return next(new AppError("Invalid category ID", 400));
      }
      filter.propertyCategory = new mongoose.Types.ObjectId(categoryId as string);
    }

    if (typeCategory) {
      filter.typeCategory = typeCategory;
    }

    const propertyTypes = await PropertyType.find(filter)
      .populate("propertyCategory", "category description")
      .sort({ typeCategory: 1, name: 1 });

    res.status(200).json({
      status: "success",
      error: false,
      message: "Property types retrieved successfully",
      totalPropertyTypes: propertyTypes.length,
      data: {
        propertyTypes,
      },
    });
  }
);

export { createPropertyType, getPropertyTypes };