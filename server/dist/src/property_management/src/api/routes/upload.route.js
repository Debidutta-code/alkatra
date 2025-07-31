"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("../../utils/multer"));
// import { uploadHandler } from "../../controller/upload.controller";
const container_1 = require("../../container");
const router = (0, express_1.Router)();
exports.default = (app) => {
    app.use("/upload", router);
    // router.route("/").post(upload.array("file"), uploadHandler as any);
    router.route("/").post(multer_1.default.array("file"), container_1.uploadController.uploadHandler.bind(container_1.uploadController));
};
//# sourceMappingURL=upload.route.js.map