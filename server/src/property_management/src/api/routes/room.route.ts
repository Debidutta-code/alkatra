import { Router } from "express";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRooms,
  getRoomsByPropertyId,
  getRoomsByPropertyId2,
  getRoomsForBooking,
  getAllRoomTypes,
  getDeepLinkData
} from "../../controller/room.controller";
import { protect } from "../../../../user_authentication/src/Middleware/auth.middleware";
import { RatePlanHotelier } from "../../controller/ratePlan.controller";
import { InventoryHotelier } from "../../controller/inventory.controller";

const router = Router();

// Singleton instance of RatePlanHotelier
const ratePlanHotelier = new RatePlanHotelier();
const inventoryHotelier = new InventoryHotelier();

export default (app: Router) => {
  app.use("/room", router);

  router.route("/get/deep_link_data/:id").get(getDeepLinkData as any);
  router.route("/rooms_by_propertyId/:id").get(getRoomsByPropertyId as any);
  router.route("/rooms_by_propertyId2/:id").post(getRoomsByPropertyId2 as any);
  router.route("/getRoomsForBooking/:id").get(getRoomsForBooking as any);
  router.route("/getAllRoomTypes").get(getAllRoomTypes as any)
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

  // Rate Plan Create Route
  router.route("/ratePlan/create").post(protect as any, ratePlanHotelier.createRatePlan.bind(ratePlanHotelier) as any);

  // Inventory Create Route
  router.route("/inventory/create").post(protect as any, inventoryHotelier.createInventory.bind(ratePlanHotelier) as any);
};