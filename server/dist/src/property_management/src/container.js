"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const service_1 = require("./service");
const controller_1 = require("./controller");
const config_1 = require("../../config");
const s3Storage = new service_1.S3FileUploadService(config_1.config.aws.bucketName);
const fileUploader = new service_1.FileUploader(s3Storage);
const uploadController = new controller_1.UploadController(fileUploader);
exports.uploadController = uploadController;
//# sourceMappingURL=container.js.map