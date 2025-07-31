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
const express_1 = require("express");
const ratePlan_controller_1 = require("../controller/ratePlan.controller");
const auth_middleware_1 = require("../../../user_authentication/src/Middleware/auth.middleware");
const route = (0, express_1.Router)();
route.put("/updateRatePlans", auth_middleware_1.protect, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ratePlan_controller_1.RatePlanController.updateRatePlan(req, res, next);
    res.status(200).json(response);
}));
route.get("/:hotelCode", auth_middleware_1.protect, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ratePlan_controller_1.RatePlanController.getRatePlanByHotelCode(req, res, next);
    res.status(200).json(response);
}));
route.post("/create", auth_middleware_1.protect, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Inside route handler");
    const response = yield ratePlan_controller_1.RatePlanController.createRatePlan(req, res, next);
    res.status(200).json(response);
}));
route.post("/hotelCode", auth_middleware_1.protect, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ratePlan_controller_1.RatePlanController.getRatePlanByHotel(req, res, next);
    res.status(200).json(response);
}));
route.get("/hotelRoomPrice", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ratePlan_controller_1.RoomPrice.getRoomPriceByHotelCode(req, res, next);
    res.status(200).json(response);
}));
route.post("/getRoomRentPrice", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ratePlan_controller_1.RoomPrice.getRoomRentController(req, res, next);
    res.status(200).json(response);
}));
route.get("/getRoomType/all", auth_middleware_1.protect, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ratePlan_controller_1.RoomPrice.getAllRoomTypeController();
    res.status(200).json(response);
}));
route.post("/checkAvailability", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ratePlan_controller_1.RoomPrice.checkAvailabilityController(req, res, next);
    res.status(200).json(response);
}));
exports.default = route;
//# sourceMappingURL=ratePlan.route.js.map