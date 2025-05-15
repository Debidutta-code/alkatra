import { Router } from "express";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRooms,
  getRoomsByPropertyId,
  getRoomsByPropertyId2,
} from "../controller/room.controller";

const router = Router();

router.route("/rooms_by_propertyId/:id").get(getRoomsByPropertyId as any);
router.route("/rooms_by_propertyId2/:id").get(getRoomsByPropertyId2 as any);


router
  .route("/")
  .get(getRooms as any)
  .post(createRoom as any);

router
  .route("/:id")
  .get(getRoomById as any)
  .put(updateRoom as any)
  .delete(deleteRoom as any);

export default router;
