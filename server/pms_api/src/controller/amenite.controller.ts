import AmeniteCategoryAttribute, {
  AmeniteAttributeType,
} from "./../model/ameniteattribute.model";
import { NextFunction, Response } from "express";
import { Request, catchAsync } from "../utils/catchAsync";
import { Role } from "../utils/jwtHelper";
import AmeniteCategory from "../model/amenitecategory.model";
import Amenite from "../model/amenite.model";
import AmeniteAttribute from "./../model/ameniteattribute.model";
import mongoose from "mongoose";

const createAmenite = catchAsync(
  async (req: Request<{}, Role>, res: Response, next: NextFunction) => {
    const body = req.body;
    console.log(body)
    const category = await AmeniteCategory.findById({ _id: body.category });
    console.log(category)

    const newAmenite = new Amenite({
      category: category?._id,
      name: body.name,
      code: body.code,
      template: {
        type: body.template.type,
      },
    });

    const createAmenityAttributePromises: any[] = [];

    if (body?.template?.attributes?.length) {
      body.template.attributes.forEach((attribute: AmeniteAttributeType) => {
        const newAmeniteAttribute = new AmeniteAttribute({
          amenity: newAmenite._id,
          attributeName: attribute.attributeName,
        });

        newAmenite.template.attributes?.push(newAmeniteAttribute._id);

        createAmenityAttributePromises.push(newAmeniteAttribute.save());
      });
    }

    await newAmenite.save();

    Promise.all(createAmenityAttributePromises);

    res.status(201).json({
      status: "success",
      error: false,
      message: "Amenite created successfully",
      data: {
        amenite: newAmenite,
      },
    });
  }
);




const getAllAmeniteCategoriesAndAllAmeniteDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ameniteCategoriesAndAllAmeniteDetails =
      await AmeniteCategory.aggregate([
        {
          $lookup: {
            from: "amenites",
            localField: "_id",
            foreignField: "category",
            as: "amenities",
            pipeline: [
              {
                $lookup: {
                  from: "ameniteattributes",
                  localField: "_id",
                  foreignField: "amenity",
                  as: "template.attributes",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        attributeName: 1,
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  code: 1,
                  isSelected: 1,
                  "template.type": 1,
                  "template.attributes": 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            category: 1,
            categoryCode: 1,
            amenities: 1,
          },
        },
      ]);

    res.status(200).json({
      status: "success",
      error: false,
      message: "Amenite category and other details fetched successfully",
      data: {
        ameniteCategoriesAndAllAmeniteDetails,
      },
    });
  }
);

const getAmeniteCategoryAndAllAmeniteDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ameniteCategoryId = req.params.ameniteCategoryId;

    const ameniteCategoryAndAllAmeniteDetails = await AmeniteCategory.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(ameniteCategoryId),
          },
        },
        {
          $lookup: {
            from: "amenites",
            localField: "_id",
            foreignField: "category",
            as: "amenities",
            pipeline: [
              {
                $lookup: {
                  from: "ameniteattributes",
                  localField: "_id",
                  foreignField: "amenity",
                  as: "template.attributes",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        attributeName: 1,
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  code: 1,
                  isSelected: 1,
                  "template.type": 1,
                  "template.attributes": 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            category: 1,
            categoryCode: 1,
            amenities: 1,
          },
        },
      ]
    );

    res.status(200).json({
      status: "success",
      error: false,
      message: "Amenite category and other details fetched successfully",
      data: {
        ameniteCategoryAndAllAmeniteDetails:
          ameniteCategoryAndAllAmeniteDetails[0],
      },
    });
  }
);

export {
  createAmenite,
  getAllAmeniteCategoriesAndAllAmeniteDetails,
  getAmeniteCategoryAndAllAmeniteDetails,
};
