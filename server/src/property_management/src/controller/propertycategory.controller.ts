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
                key: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          types: 1,
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
                key: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          types: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

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
    const user = req.user;
    const Role = req.role;

    if (req.role !== "superadmin") {
      return next(
        new AppError("You'r not authorized to perform this operation", 401)
      );
    }
    const category = req.body.category as string;
    if (!category) {
      return next(
        new AppError("Please provide the category you want to add", 400)
      );
    }

    const propertyCategory = new PropertyCategory({
      category: category.toUpperCase(),
    });

    const newpropertyinfo = await propertyCategory.save();

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

export {
  createPropertyCategory,
  getAllPropertyCategories,
  getPropertyCategory,
};
