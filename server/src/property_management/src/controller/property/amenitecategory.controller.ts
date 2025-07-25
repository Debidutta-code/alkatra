// import { NextFunction, Response } from "express";
// import { AppError } from "../../utils/appError";
// import { Request, catchAsync } from "../../utils/catchAsync";
// import AmeniteCategory from "../../model/amenitecategory.model";
// import { PropertyInfo } from "../../model/property.info.model";

// const createAmeniteCategory = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.body) {
//       next(new AppError("Please fill all the required fields", 400));
//     }

//     const ameniteCategory = new AmeniteCategory({
//       ...req.body,
//     });

//     await ameniteCategory.save();

//     res.status(201).json({
//       status: "success",
//       error: false,
//       message: "Amenite category added successfully",
//       data: {
//         ameniteCategory,
//       },
//     });
//   }
// );

// const getAllAmeniteCategoriesAndAllAmeniteDetails = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const ameniteCategoriesAndAllAmeniteDetails =
//       await AmeniteCategory.aggregate([
//         {
//           $lookup: {
//             from: "amenites",
//             localField: "_id",
//             foreignField: "category",
//             as: "amenities",
//             pipeline: [
//               {
//                 $lookup: {
//                   from: "ameniteattributes",
//                   localField: "_id",
//                   foreignField: "amenity",
//                   as: "template.attributes",
//                   pipeline: [
//                     {
//                       $project: {
//                         _id: 1,
//                         attributeName: 1,
//                       },
//                     },
//                   ],
//                 },
//               },
//               {
//                 $project: {
//                   _id: 1,
//                   name: 1,
//                   code: 1,
//                   isSelected: 1,
//                   "template.type": 1,
//                   "template.attributes": 1,
//                 },
//               },
//             ],
//           },
//         },
//         {
//           $project: {
//             category: 1,
//             categoryCode: 1,
//             amenities: 1,
//           },
//         },
//       ]);

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "Amenite category and other details fetched successfully",
//       data: {
//         ameniteCategoriesAndAllAmeniteDetails,
//       },
//     });
//   }
// );

// const getAmeniteCategory = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const propertyId = req.params.id;
//     const propertyAmeniteCategory = await AmeniteCategory.findById(propertyId);

//     if (!propertyAmeniteCategory) {
//       return next(
//         new AppError(`No property found with this id ${propertyId}`, 404)
//       );
//     }

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "Property aminite category fetched successfully",
//       data: propertyAmeniteCategory,
//     });
//   }
// );

// const getPropertyAminitesategories = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const propertyAminitesCategories = await AmeniteCategory.find();

//     if (!propertyAminitesCategories) {
//       return next(new AppError(`No property amenites category found  `, 404));
//     }

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "Property aminite category fetched successfully",
//       data: propertyAminitesCategories,
//     });
//   }
// );

// const getDestinationType = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const uniqueDestinationTypes =
//       await AmeniteCategory.distinct("destination_type");

//     if (!uniqueDestinationTypes) {
//       return next(new AppError(`No destination type found  `, 404));
//     }

//     res.status(200).json({
//       status: "success",
//       error: false,
//       message: "Destination type  fetched successfully",
//       data: uniqueDestinationTypes,
//     });
//   }
// );

// export {
//   createAmeniteCategory,
//   getAllAmeniteCategoriesAndAllAmeniteDetails,
//   getPropertyAmeniteCategory,
//   getPropertyAminitesategories,
//   getDestinationType,
// };
