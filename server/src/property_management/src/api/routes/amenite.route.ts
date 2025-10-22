// import { protect } from "./../../middlewares/auth.middleware";
// import { createAmeniteCategory, getAllAmeniteCategoriesAndAllAmeniteDetails } from "../../controller/property/amenitecategory.controller";
// import { createAmenite } from "../../controller/amenite.controller";

import { Router } from "express";
import { protect } from "../../../../user_authentication/src/Middleware/auth.middleware";
import{ createRoomAminity, deleteRoomAmenity, getRoomAminity, updateRoomAmenity } from "../../controller/room.aminity"

const router = Router();

export default (app: Router) => {
  app.use("/amenite", router); 

  router.route('/:id').get(getRoomAminity as any)

  router.route("/roomaminity").post(createRoomAminity as any)
  router.route("/update-room-amenity").patch(protect as any, updateRoomAmenity as any)
  router.route("/delete-room-amenity").delete(protect as any, deleteRoomAmenity as any)

  // router.route("/").post(protect as any, createAmenite as any)
  // router
    // .route("/category")
    // .post(createAmeniteCategory as any)
    // .get(getAllAmeniteCategoriesAndAllAmeniteDetails as any);
};