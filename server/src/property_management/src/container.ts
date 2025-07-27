import { S3FileUploadService, FileUploader } from "./service";
import { UploadController } from "./controller";
import { config } from "../../config";

const s3Storage = new S3FileUploadService(config.aws.bucketName);
const fileUploader = new FileUploader(s3Storage);
const uploadController = new UploadController(fileUploader);

export { uploadController };