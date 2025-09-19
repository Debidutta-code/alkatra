import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { Request, catchAsync } from "../utils/catchAsync";
import { PropertyInfo } from "../model/property.info.model";
import { decodeToken } from "../utils/jwtHelper";
import { Category } from "../model/propertycategory.model";
import { PropertyAddress } from "../model/property.address.model";
import { propertyAminity } from "../model/propertyamenite.model";
import { RoomAminity } from "../model/room.amenite.model";
import PropertyPrice from "../model/ratePlan.model";
import PropertyRatePlan from "../model/ratePlan.model";
import mongoose, { Types } from "mongoose";
import UserModel from "../../../user_authentication/src/Model/auth.model"
import { PropertyInfoService } from "../service";

interface hotels {
  _id: string,
  name: string,
  image: []
}

interface Test {
  groupManagerName: string;
  _id: string;
  hotels: hotels[]
}

const createpropertyInfo = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (req.role === "user") {
      return next(
        new AppError("You are not allowed to perform this action", 401)
      );
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
      property_type,
    } = req.body;

    console.log(
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n",
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

    const property = await PropertyInfo.findOne({ property_email });

    if (property) {
      return next(
        new AppError("A property already exists with this email", 400)
      );
    }
    // const propertyCode = await generateUniquePropertyCode();

    const newProperty = new PropertyInfo({
      user_id: user.id,
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

const getMyProperties = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const user = req.user.id;
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

const getAdminProperties = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    try {

      const userId = req.user?.id;

      // Validate userId exists
      if (!userId) {
        return next(new AppError('User ID not found in request', 401));
      }

      // Validate userId is a valid ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      const actualUser = await UserModel.findById(userId);

      if (!actualUser) {
        return next(new AppError('User not found', 404));
      }

      const userRole = actualUser.role;
      let responseData: any = {};
      console.log(userRole)

      switch (userRole) {
        case "superAdmin":
          const userEmail = actualUser.email;

          // 1. Get direct hotel managers created by superAdmin
          const directHotelManagers = await UserModel.find({
            role: "hotelManager",
            createdBy: userEmail
          });

          // 2. Get group managers created by superAdmin
          const groupManagers = await UserModel.find({
            role: "groupManager",
            createdBy: userEmail
          });

          // 3. Get properties for direct hotel managers
          const directHotelManagerIds = directHotelManagers.map(hm => hm._id);
          const directProperties = await PropertyInfo.find({
            user_id: { $in: directHotelManagerIds }
          }).select("_id image property_name");

          // 4. Process grouped hotels by group manager
          const groupedResults = [];

          for (const groupManager of groupManagers) {
            // Get hotel managers under this group manager
            const hotelManagersUnderGroup = await UserModel.find({
              role: "hotelManager",
              createdBy: groupManager.email
            });

            // Get properties for these hotel managers
            const hotelManagerIds = hotelManagersUnderGroup.map(hm => hm._id);
            const propertiesUnderGroup = await PropertyInfo.find({
              user_id: { $in: hotelManagerIds }
            }).select("_id image property_name");

            // Format hotels array
            const hotels = propertiesUnderGroup.map(property => ({
              _id: property._id,
              name: property.property_name,
              image: property.image || []
            }));

            // Add to grouped results
            groupedResults.push({
              groupManagerName: `${groupManager.firstName} ${groupManager.lastName}` || groupManager.email,
              id: groupManager._id.toString(),
              hotels: hotels
            });
          }

          // Format direct properties
          const directHotels = directProperties.map(property => ({
            _id: property._id,
            name: property.property_name,
            image: property.image || []
          }));

          responseData = {
            direct: directHotels,
            grouped: groupedResults,
          };
          break;

        case "groupManager":
          // Get hotel managers created by this group manager
          const managedHotelManagers = await UserModel.find({
            role: "hotelManager",
            createdBy: actualUser.email
          });

          if (managedHotelManagers.length === 0) {
            console.log('No hotel managers found for this group manager');
            responseData = {
              properties: [],
              draftProperties: []
            };
            break;
          }

          const managedHotelManagerIds = managedHotelManagers.map(hm => hm._id);
          console.log('Managed hotel manager IDs:', managedHotelManagerIds);

          // Fetch all properties for these hotel managers
          const allProperties = await PropertyInfo.find({
            user_id: { $in: managedHotelManagerIds }
          }).select("_id image property_name");

          // console.log('All properties found:', allProperties.length);
          const allHotels = allProperties.map(property => ({
            _id: property._id,
            name: property.property_name,
            image: property.image || []
          }));

          responseData = {
            direct: allHotels,
          };
          break;

        default:
          return next(new AppError('Invalid user role', 400));
      }

      res.status(200).json({
        status: "success",
        error: false,
        message: "Data fetched successfully",
        data: responseData
      });

    } catch (error: any) {
      console.log('Error in getAdminProperties:', error.message);
      console.log('Full error:', error);
      return next(new AppError('Internal server error', 500));
    }
  }
);

const updatePropertyInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertInfoId = req.params.id;
    const {
      property_name,
      property_email,
      property_contact,
      // star_rating,
      // property_code,
      image,
      description,
      status,
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

    const updateProperty = await PropertyInfo.findByIdAndUpdate(
      propertInfoId,
      {
        $set: {
          property_name,
          property_email,
          property_contact,
          // star_rating,
          // property_code,
          image,
          description,
          status,
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

const getPropertyInfoById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    const property = await PropertyInfo.findById(propertyId)
      .populate({ path: "status" })
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
          from: 'rooms', 
          localField: 'applicable_room_type', 
          foreignField: '_id', 
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

export {
  createpropertyInfo,
  updatePropertyInfo,
  deleteProperty,
  getPropertyInfoById,
  getAllProperty,
  getMyProperties,
  getProperties,
  getAdminProperties,
};


export class PropertyInfoController {

  private propertyInfoService: PropertyInfoService;

  constructor(propertyInfoService: PropertyInfoService) {
    this.propertyInfoService = propertyInfoService;
  }

  async propertyInfoUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const propertInfoId = req.params.id;
      const {
        property_name,
        property_email,
        property_contact,
        star_rating,
        image,
        description,
        status,
      } = req.body;

      const updatedPropertyInfo = await this.propertyInfoService.propertyUpdate(
        propertInfoId,
        property_name,
        property_email,
        property_contact,
        star_rating,
        image,
        description,
        status
      );

      if (!updatedPropertyInfo) {
        return res.status(404).json({ message: "Property not found" });
      }

      return res.status(200).json({
        status: "success",
        error: false,
        message: "Property updated successfully",
        data: updatedPropertyInfo,
      });
    }
    catch (error: any) {
      console.log("Error updating property:", error);
      return res.status(500).json({ message: error.message || "Error updating property" });
    }
  }
}