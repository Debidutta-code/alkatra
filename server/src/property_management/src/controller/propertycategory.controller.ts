import { NextFunction, Response } from "express";
import { Request, catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import PropertyCategory from "../model/propertycategory.model";
import { Role } from "../utils/jwtHelper";
import mongoose from "mongoose";

const getAllPropertyCategories = catchAsync(
  async (req: Request<{}, Role>, res: Response, next: NextFunction) => {
    const categories = await PropertyCategory.aggregate([
      {
        $lookup: {
          from: "propertytypes",
          localField: "_id",
          foreignField: "propertyCategory",
          as: "types",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                code: 1,
                typeCategory: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          description: 1,
          // Group types by typeCategory (Most common vs Others)
          mostCommonTypes: {
            $filter: {
              input: "$types",
              as: "type",
              cond: { $eq: ["$$type.typeCategory", "Most common"] },
            },
          },
          otherTypes: {
            $filter: {
              input: "$types",
              as: "type",
              cond: { $eq: ["$$type.typeCategory", "Others"] },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      error: false,
      message: "Property categories fetched successfully",
      totalPropertyCategories: categories.length,
      data: {
        categories,
      },
    });
  }
);

const getPropertyCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyCategoryID = req.params.propertyCategoryID;

    if (!mongoose.Types.ObjectId.isValid(propertyCategoryID)) {
      return next(new AppError("Invalid property category ID", 400));
    }

    const propertyCategory = await PropertyCategory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(propertyCategoryID),
        },
      },
      {
        $lookup: {
          from: "propertytypes",
          localField: "_id",
          foreignField: "propertyCategory",
          as: "types",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                code: 1,
                typeCategory: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          description: 1,
          mostCommonTypes: {
            $filter: {
              input: "$types",
              as: "type",
              cond: { $eq: ["$$type.typeCategory", "Most common"] },
            },
          },
          otherTypes: {
            $filter: {
              input: "$types",
              as: "type",
              cond: { $eq: ["$$type.typeCategory", "Others"] },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!propertyCategory || propertyCategory.length === 0) {
      return next(new AppError("Property category not found", 404));
    }

    return res.status(200).json({
      status: "success",
      error: false,
      message: "Property category fetched successfully",
      data: {
        propertyCategory: propertyCategory[0],
      },
    });
  }
);

const createPropertyCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.role !== "superadmin") {
      return next(
        new AppError("You're not authorized to perform this operation", 401)
      );
    }

    const { category, description } = req.body;

    if (!category) {
      return next(new AppError("Please provide the category", 400));
    }

    const existingCategory = await PropertyCategory.findOne({ category });
    if (existingCategory) {
      return next(new AppError("Category already exists", 400));
    }

    const propertyCategory = new PropertyCategory({
      category,
      description,
    });

    await propertyCategory.save();

    return res.status(201).json({
      status: "success",
      error: false,
      message: "Property category created successfully",
      data: {
        propertyCategory,
      },
    });
  }
);

export { createPropertyCategory, getAllPropertyCategories, getPropertyCategory };