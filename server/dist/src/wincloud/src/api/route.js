"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotelSyncController_1 = require("../controller/hotelSyncController");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
const hotelSyncController = new hotelSyncController_1.HotelSyncController();
router.post('/hotel-sync', express_2.default.text({ type: ['application/xml', 'text/xml'], limit: '10mb' }), hotelSyncController.handleHotelSyncUpdate.bind(hotelSyncController));
exports.default = router;
//# sourceMappingURL=route.js.map