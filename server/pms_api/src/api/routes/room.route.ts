import { Router } from "express";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRooms,
  getRoomsByPropertyId,
  // getRoomsByPropertyId2,
  getRoomsForBooking,
  createRoomType,
  getRoomTypes,
} from "../../controller/room.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

export default (app: Router) => {
  app.use("/room", router);

  router.route("/rooms_by_propertyId/:id").get(getRoomsByPropertyId as any);
  // router.route("/rooms_by_propertyId2/:id").get(getRoomsByPropertyId2 as any);
  router.route("/getRoomsForBooking/:id").get(getRoomsForBooking as any);
  router.route("/type").post(createRoomType as any);
  router.route("/type").get(getRoomTypes as any);

  router
    .route("/")
    .get(getRooms as any)
    .post(createRoom as any);

  router
    .route("/:id")
    .get(getRoomById as any)
    .post(createRoom as any)
    .patch(updateRoom as any)
    .delete(deleteRoom as any);
};
