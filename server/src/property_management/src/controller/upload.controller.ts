import { NextFunction, Response } from "express";
import { Request, catchAsync } from "../utils/catchAsync";
// import { cloudinary } from "../utils/cloudinary";
import { AppError } from "../utils/appError";

import { IFileUploader } from "../../../interfaces"

// export const uploadHandler = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const files = req.files;
//     let cloudinaryFolderName = "";

//     console.log({ files: req.body.files });

//     if (!files?.length) {
//       return next(new AppError("Upload at least one file", 400));
//     }

//     const uploadPromiseArray = [];

//     if (Array.isArray(files)) {
//       for (const file of files) {
//         uploadPromiseArray.push(
//           cloudinary.uploader.upload(file.path, {
//             folder: cloudinaryFolderName,
//           })
//         );
//       }
//     }

//     try {
//       const cloudinaryFolderCreationResponse =
//         await cloudinary.api.create_folder("TRAVEL_MVP");
//       cloudinaryFolderName = cloudinaryFolderCreationResponse.name;
//       const cloudinaryRes = await Promise.all(uploadPromiseArray);
//       const urls = cloudinaryRes.map((singleUploadRes) => ({
//         public_id: singleUploadRes.public_id,
//         url: singleUploadRes.url,
//         secure_url: singleUploadRes.secure_url,
//       }));

//       res.status(201).json({
//         status: "success",
//         error: false,
//         message: "File uploaded successfully",
//         data: {
//           urls,
//         },
//       });
//     } catch (err) {
//       console.log(err);
//       next(err);
//     }
//   }
// );



export class UploadController {
  constructor(private readonly uploader: IFileUploader) { }

  uploadHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = req.files as Express.Multer.File[];
        const folder = "uploads";

        if (!files?.length) {
          return next(new AppError("Upload at least one file", 400));
        }

        const urls = await this.uploader.uploadFiles(files, folder);

        res.status(201).json({
          status: "success",
          error: false,
          message: "File uploaded successfully",
          data: { urls },
        });
      } catch (err) {
        next(err);
      }
    }
  )
}