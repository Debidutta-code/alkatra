"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_services_1 = require("../services/admin.services");
const auth_middleware_1 = require("../../../user_authentication/src/Middleware/auth.middleware");
const AdminRoutes = (0, express_1.Router)();
AdminRoutes.get("/getHotelManagerRooms", auth_middleware_1.protect, (req, res, next) => {
    return admin_services_1.AdminServices.getHotelManagersHotel(req, res, next);
});
exports.default = AdminRoutes;
//# sourceMappingURL=rolebased.route.js.map