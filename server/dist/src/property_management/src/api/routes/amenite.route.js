"use strict";
// import { protect } from "./../../middlewares/auth.middleware";
// import { createAmeniteCategory, getAllAmeniteCategoriesAndAllAmeniteDetails } from "../../controller/property/amenitecategory.controller";
// import { createAmenite } from "../../controller/amenite.controller";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../../user_authentication/src/Middleware/auth.middleware");
const room_aminity_1 = require("../../controller/room.aminity");
const router = (0, express_1.Router)();
exports.default = (app) => {
    app.use("/amenite", router);
    router.route('/:id').get(room_aminity_1.getRoomAminity);
    router.route("/roomaminity").post(room_aminity_1.createRoomAminity);
    router.route("/update-room-amenity").patch(auth_middleware_1.protect, room_aminity_1.updateRoomAmenity);
    router.route("/delete-room-amenity").delete(auth_middleware_1.protect, room_aminity_1.deleteRoomAmenity);
    // router.route("/").post(protect as any, createAmenite as any)
    // router
    // .route("/category")
    // .post(createAmeniteCategory as any)
    // .get(getAllAmeniteCategoriesAndAllAmeniteDetails as any);
};
//# sourceMappingURL=amenite.route.js.map