"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const amenite_route_1 = __importDefault(require("./routes/amenite.route"));
const property_route_1 = __importDefault(require("./routes/property.route"));
const room_route_1 = __importDefault(require("./routes/room.route"));
const upload_route_1 = __importDefault(require("./routes/upload.route"));
exports.default = () => {
    const app = (0, express_1.Router)();
    (0, amenite_route_1.default)(app);
    (0, property_route_1.default)(app);
    (0, room_route_1.default)(app);
    (0, upload_route_1.default)(app);
    return app;
};
//# sourceMappingURL=index.js.map