"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../../controller/room.controller");
const router = (0, express_1.Router)();
exports.default = (app) => {
    app.use("/room", router);
    router.route("/rooms_by_propertyId/:id").get(room_controller_1.getRoomsByPropertyId);
    router.route("/rooms_by_propertyId2/:id").post(room_controller_1.getRoomsByPropertyId2);
    router.route("/getRoomsForBooking/:id").get(room_controller_1.getRoomsForBooking);
    router.route("/getAllRoomTypes").get(room_controller_1.getAllRoomTypes);
    router
        .route("/")
        .get(room_controller_1.getRooms)
        .post(room_controller_1.createRoom);
    router
        .route("/:id")
        .get(room_controller_1.getRoomById)
        .post(room_controller_1.createRoom)
        .patch(room_controller_1.updateRoom)
        .delete(room_controller_1.deleteRoom);
};
//# sourceMappingURL=room.route.js.map