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
exports.getPropertyTypes = exports.createPropertyType = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const propertytype_model_1 = __importDefault(require("../model/propertytype.model"));
const createPropertyType = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.role != "superadmin") {
        return next(new appError_1.AppError("You'r not authorized to perform this operation", 401));
    }
    if (!req.body) {
        return next(new appError_1.AppError("Please provide all the required data", 400));
    }
    const newPropertyType = new propertytype_model_1.default(Object.assign({}, req.body));
    yield newPropertyType.save();
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property type created successfully",
        data: {
            newPropertyType,
        },
    });
}));
exports.createPropertyType = createPropertyType;
const getPropertyTypes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyTypes = yield propertytype_model_1.default.find();
        if (!propertyTypes) {
            return res.status(404).json({
                status: "fail",
                message: "No property types found",
                data: null,
            });
        }
        res.status(200).json({
            status: "success",
            message: "Property types retrieved successfully",
            data: {
                propertyTypes,
            },
        });
    }
    catch (error) {
        return next(new appError_1.AppError("Failed to fetch property types", 500));
    }
}));
exports.getPropertyTypes = getPropertyTypes;
//# sourceMappingURL=propertytype.controller.js.map