"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const catchAsync_1 = require("../utils/catchAsync");
// import { cloudinary } from "../utils/cloudinary";
const appError_1 = require("../utils/appError");
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
class UploadController {
    constructor(uploader) {
        this.uploader = uploader;
        this.uploadHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const files = req.files;
                const folder = "uploads";
                if (!(files === null || files === void 0 ? void 0 : files.length)) {
                    return next(new appError_1.AppError("Upload at least one file", 400));
                }
                const urls = yield this.uploader.uploadFiles(files, folder);
                res.status(201).json({
                    status: "success",
                    error: false,
                    message: "File uploaded successfully",
                    data: { urls },
                });
            }
            catch (err) {
                next(err);
            }
        }));
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=upload.controller.js.map