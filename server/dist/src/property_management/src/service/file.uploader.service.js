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
exports.FileUploader = void 0;
const promises_1 = __importDefault(require("fs/promises"));
class FileUploader {
    constructor(storageProvider) {
        this.storageProvider = storageProvider;
    }
    uploadFiles(files, destinationFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploads = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const key = `${destinationFolder}/${Date.now()}_${file.originalname}`;
                const url = yield this.storageProvider.upload(file.path, key);
                // Clean up local file after successful upload
                yield promises_1.default.unlink(file.path);
                return url;
            })));
            return uploads;
        });
    }
}
exports.FileUploader = FileUploader;
//# sourceMappingURL=file.uploader.service.js.map