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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3FileUploadService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../../config");
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const { region, s3ACL } = config_1.config.aws;
class S3FileUploadService {
    constructor(bucketName) {
        this.bucketName = bucketName;
    }
    upload(filePath, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileStream = fs_1.default.createReadStream(filePath);
            const lookupResult = mime_types_1.default.lookup(filePath);
            const contentType = typeof lookupResult === "string" ? lookupResult : undefined;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileStream,
                ContentType: contentType,
                // ContentDisposition: "inline",
            });
            yield config_1.s3Client.send(command);
            return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
        });
    }
}
exports.S3FileUploadService = S3FileUploadService;
//# sourceMappingURL=s3.file.upload.service.js.map