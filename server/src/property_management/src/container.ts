import { config } from "../../config";
import { S3FileUploadService, FileUploader, PropertyInfoService } from "./service";
import { UploadController } from "./controller";
import { PropertyInfoRepository } from "./repositories";

const s3Storage = new S3FileUploadService(config.aws.bucketName);
const fileUploader = new FileUploader(s3Storage);
const uploadController = new UploadController(fileUploader);

const propertyInfoRepository = PropertyInfoRepository.getInstance();
const propertyInfoService = PropertyInfoService.getInstance(propertyInfoRepository);

export { 
    uploadController,
    propertyInfoRepository,
    propertyInfoService 
};