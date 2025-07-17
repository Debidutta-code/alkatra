import { Router } from "express";
import {
  createAmeniteCategory,
  getAllAmeniteCategoriesAndAllAmeniteDetails,
} from "../../controller/property/amenitecategory.controller";
import {
  createAmenite,
 
  // getAllAmeniteCategoriesAndAllAmeniteDetails,
} from "../../controller/amenite.controller";
// import { protect } from "./../../middlewares/auth.middleware";
import { protect } from "../../../../User-Authentication/src/Middleware/auth.middleware";
import{ createRoomAminity, deleteRoomAmenity, getRoomAminity, updateRoomAmenity } from "../../controller/room.aminity"

const router = Router();

export default (app: Router) => {
  app.use("/amenite", router);

  router
    .route("/category")
    .post(createAmeniteCategory as any)
    .get(getAllAmeniteCategoriesAndAllAmeniteDetails as any);

  router.route("/").post(protect as any, createAmenite as any)

  router.route('/:id').get(getRoomAminity as any)

  router.route("/roomaminity").post(createRoomAminity as any)
  router.route("/update-room-amenity").patch(protect as any, updateRoomAmenity as any)
  router.route("/delete-room-amenity").delete(protect as any, deleteRoomAmenity as any)

};

// .get(getAllAmeniteCategoriesAndAllAmeniteDetails as any)


