import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { PropertyInfo } from "../model/property.info.model";
import { decodeToken } from "../utils/jwtHelper";
import { UserType } from "../model/user.model";
import { Category } from "../model/propertycategory.model";
import PropertyCategory from "../model/propertycategory.model"
import { Role } from "../utils/jwtHelper";
import { PropertyAddress } from "../model/property.address.model";
import { propertyAminity } from "../model/propertyamenite.model";
import { RoomAminity } from "../model/room.amenite.model";
import PropertyPrice from "../model/ratePlan.model";
import PropertyType from "../model/propertytype.model";
import PropertyRatePlan from "../model/ratePlan.model";
import { Brand } from "../model/brand.model";
import mongoose, { Types } from "mongoose";

const getMyProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const properties = await PropertyInfo.find({ user_id: user, isDraft: false });
    const draftProperties = await PropertyInfo.find({ user_id: user, isDraft: true });

    res.status(200).json({
      status: "success",
      error: "false",
      message: "Data fetched successfully",
      data: {
        properties,
        draftProperties,
      },
    });
  }
);


const createpropertyInfo = catchAsync(
  async (
    req: Request<UserType["userId"]>,
    res: Response,
    next: NextFunction
  ) => {
    if (req.role === "user") {
      return next(new AppError("You are not allowed to perform this action", 401));
    }

    const user = req.user;
    let isHotelFlow = false;
    let isHomestayFlow = false;

    const {
      property_name,
      property_email,
      property_contact,
      star_rating,
      property_code,
      image,
      description,
      property_category,
      property_type
    } = req.body;
    const brand_name = req.body.brand_name;

    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n",
      brand_name,
      property_name,
      property_email,
      property_contact,
      star_rating,
      property_code,
      image,
      description,
      property_category,
      property_type
    );

    const propertyCategory = property_category as Category;

    if (propertyCategory === Category.HOTEL) isHotelFlow = true;
    if (propertyCategory === Category.HOMESTAY) isHomestayFlow = true;

    if (!req.body) {
      return next(new AppError("Please fill all the required fields", 400));
    }

    let brandId: Types.ObjectId | null = null;

    if (brand_name) {
      const formattedBrandName = brand_name.toUpperCase();
      let existingBrand = await Brand.findOne({ brand_name: formattedBrandName });

      if (existingBrand) {
        brandId = existingBrand._id as Types.ObjectId;
      } else {
        const newBrand = await Brand.create({ brand_name: formattedBrandName });
        brandId = newBrand._id as Types.ObjectId;
      }
    }

    const property = await PropertyInfo.findOne({ property_email });

    if (property) {
      return next(new AppError("A property already exists with this email", 400));
    }

    const existingPropertyCode = await PropertyInfo.findOne({ property_code });
    if (existingPropertyCode) {
      return next(new AppError("A property already exists with this property code", 400));
    }

    const newProperty = new PropertyInfo({
      user_id: user,
      property_name,
      property_email,
      property_contact,
      star_rating,
      property_code,
      image,
      property_category,
      property_type,
      description,
      brand: brandId,
    });

    await newProperty.save();
    console.log("create Property ", newProperty);
    res.status(201).json({
      status: "success",
      error: false,
      message: "Property registered successfully",
      data: {
        isHomestayFlow,
        isHotelFlow,
        property: newProperty,
      },
    });
  }
);



const updatePropertyInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertInfoId = req.params.id;
    const {
      property_name,
      property_email,
      property_contact,
      star_rating,
      property_code,
      image,
      description,
    } = req.body;

    const property = await PropertyInfo.findById(propertInfoId);
    if (!property) {
      return next(
        new AppError(`No property found with this id ${propertInfoId}`, 404)
      );
    }
    // Check for duplicate property_email if changed
    if (property_email && property_email !== property.property_email) {
      const existingEmail = await PropertyInfo.findOne({ property_email });
      if (existingEmail) {
        return next(new AppError("A property already exists with this email", 400));
      }
    }

    // Check for duplicate property_code if changed
    if (property_code && property_code !== property.property_code) {
      const existingCode = await PropertyInfo.findOne({ property_code });
      if (existingCode) {
        return next(new AppError("A property already exists with this property code", 400));
      }
    }
    const updateProperty = await PropertyInfo.findByIdAndUpdate(
      propertInfoId,
      {
        $set: {
          property_name,
          property_email,
          property_contact,
          star_rating,
          property_code,
          image,
          description,
        }
      },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      error: false,
      message: "Property updated successfully",
      data: updateProperty,
    });
  }
);

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const propertyInfoId = req.params.id;

  const property = await PropertyInfo.findById(propertyInfoId);
  if (!property) {
    return next(new AppError(`No property found with this id ${property}`, 404));
  }

  await Promise.all([
    PropertyAddress.findByIdAndDelete(property?.property_address),
    propertyAminity.findByIdAndDelete(property?.property_amenities),
    RoomAminity.findByIdAndDelete(property?.room_Aminity),
    PropertyPrice.findByIdAndDelete(property?.rate_plan),
  ]);
  await PropertyInfo.findByIdAndDelete(propertyInfoId);

  res.status(200).json({
    status: "success",
    error: false,
    message: "Property deleted successfully",
    data: null,
  });
}
);

const getPropertyInfoById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    const property = await PropertyInfo.findById(propertyId)
      .populate({ path: "property_category" })
      .populate({ path: "property_address" })
      .populate({ path: "property_amenities" })
      .populate({ path: "property_room" })
      .populate({ path: "room_Aminity" })
      .populate({ path: "rate_plan" })
      .lean();

    const rateplan = await PropertyRatePlan.aggregate([
      { $match: { property_id: new mongoose.Types.ObjectId(propertyId) } },

      {
        $lookup: {
          from: 'rooms', // The collection to join
          localField: 'applicable_room_type', // The field from the input documents
          foreignField: '_id', // The field from the documents of the "from" collection
          as: 'applicable_room_type'
        }
      },
      { $unwind: '$applicable_room_type' },

      {
        $project: {
          applicable_room: '$applicable_room_type.room_name',
          applicable_room_type: '$applicable_room_type.room_type',
          propertyInfo_id: '$applicable_room_type.propertyInfo_id',
          _id: 1,
          meal_plan: 1,
          room_price: 1,
          rate_plan_name: 1,
          rate_plan_description: 1,
          min_length_stay: 1,
          max_length_stay: 1,
          min_book_advance: 1,
          max_book_advance: 1,
        }
      }
    ])

    const properties = {
      ...property,
      rate_plan: rateplan
    }

    if (!properties) {
      return next(
        new AppError(`No property found with this id ${propertyId}`, 404)
      );
    }

    res.status(200).json({
      status: "success",
      error: false,
      message: "Property fetched successfully",
      data: properties,
    });
  }
);

const getAllProperty = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  const deToken = await decodeToken(
    token as any,
    process.env.JWT_SECRET_KEY as any
  );

  const properties = await PropertyInfo.find({ user_Id: deToken.id });

  res.status(200).json({
    status: "success",
    error: false,
    message: "Property fetched successfully",
    totalProperty: properties.length,
    data: properties,
  });
});

const getProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const property = await PropertyInfo.find();

    if (!property) {
      return next(new AppError(`No property found with this id `, 404));
    }

    res.status(200).json({
      status: "success",
      error: false,
      message: "Property  fetched successfully",
      length: property.length,
      data: property.reverse(),
    });
  }
);

export {
  createpropertyInfo,
  updatePropertyInfo,
  deleteProperty,
  getPropertyInfoById,
  getAllProperty,
  getMyProperties,
  getProperties,
};
