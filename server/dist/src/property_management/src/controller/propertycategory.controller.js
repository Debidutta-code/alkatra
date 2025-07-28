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
exports.getPropertyCategory = exports.getAllPropertyCategories = exports.createPropertyCategory = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const propertycategory_model_1 = __importDefault(require("../model/propertycategory.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllPropertyCategories = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield propertycategory_model_1.default.aggregate([
        {
            $lookup: {
                from: "propertytypes",
                localField: "_id",
                foreignField: "propertyCategory",
                as: "types",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            _id: 1,
                            key: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                category: 1,
                types: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);
    res.status(200).json({
        status: "success",
        error: false,
        message: "Property categories fetched successfully",
        totalPropertyCategories: categories.length,
        data: {
            categories,
        },
    });
}));
exports.getAllPropertyCategories = getAllPropertyCategories;
const getPropertyCategory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyCategoryID = req.params.propertyCategoryID;
    const propertyCategory = yield propertycategory_model_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(propertyCategoryID),
            },
        },
        {
            $lookup: {
                from: "propertytypes",
                localField: "_id",
                foreignField: "propertyCategory",
                as: "types",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            _id: 1,
                            key: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                category: 1,
                types: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);
    return res.status(200).json({
        status: "success",
        error: false,
        message: "Property category fetched successfully",
        data: {
            propertyCategory: propertyCategory[0],
        },
    });
}));
exports.getPropertyCategory = getPropertyCategory;
const createPropertyCategory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const Role = req.role;
    if (req.role !== "superadmin") {
        return next(new appError_1.AppError("You'r not authorized to perform this operation", 401));
    }
    const category = req.body.category;
    if (!category) {
        return next(new appError_1.AppError("Please provide the category you want to add", 400));
    }
    const propertyCategory = new propertycategory_model_1.default({
        category: category.toUpperCase(),
    });
    const newpropertyinfo = yield propertyCategory.save();
    return res.status(201).json({
        status: "success",
        error: false,
        message: "Property category created successfully",
        data: {
            propertyCategory,
        },
    });
}));
exports.createPropertyCategory = createPropertyCategory;
//# sourceMappingURL=propertycategory.controller.js.map