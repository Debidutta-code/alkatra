"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: `public/uploads`,
        filename: (req, file, cb) => {
            // Define the filename for the uploaded file
            cb(null, file.originalname);
        },
    }),
    limits: {
        fileSize: 10000000,
    },
});
exports.default = upload;
//# sourceMappingURL=multer.js.map